const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');
const AuditLog = require('../models/AuditLog');
const { classifyTransaction } = require('../services/classifier');
const { applyDecisionBounds } = require('../services/decisionEngine');
const { executeAction } = require('../services/razorpayExecutor');
const { getGuardrails, updateGuardrails, resetGuardrailsToDefault } = require('../services/guardrails');

const CONCURRENCY = 3; // Stays within Groq's 8k TPM/min on free tier

// In-memory progress store — lightweight, single-server demo
let batchProgress = null; // null = no batch running

function setBatchProgress(data) {
  batchProgress = data;
}

/**
 * Process one transaction through classify → decide → execute.
 * Never throws — always returns a result object.
 */
async function processTx(tx, onEvent, customGuardrails = null) {
  const id = tx.transactionId;
  const step = (stage, msg, extra = {}) => {
    console.log(`[Batch][${id}][${stage}] ${msg}`);
    if (onEvent) onEvent({ transactionId: id, stage, message: msg, ts: Date.now(), ...extra });
  };

  try {
    // ── Mark processing ───────────────────────────────────────────────────────
    tx.status = 'processing';
    await tx.save().catch(e => { throw new Error(`DB save (processing): ${e.message}`); });
    const formattedAmt = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(tx.amount);
    step('init', `Starting recovery pipeline — ${formattedAmt}, ${tx.failureType.replace(/_/g, ' ')}`);

    // ── Step 1: Classify ──────────────────────────────────────────────────────
    step('classify', 'Calling Groq AI classifier...');
    let classifierOutput;
    try {
      classifierOutput = await classifyTransaction(tx);
      step('classify', `→ ${classifierOutput.recommendedAction.replace(/_/g, ' ')} (${classifierOutput.confidence?.toUpperCase()} confidence) — "${classifierOutput.rootCause}"`);
    } catch (classErr) {
      step('classify', `Classification fallback — defaulting to flag for review`);
      classifierOutput = {
        rootCause: 'Classifier exception fallback',
        confidence: 'low',
        recommendedAction: 'flag_ambiguous',
        reasoning: `Classifier note: ${classErr.message}`
      };
    }
    tx.classifierOutput = classifierOutput;

    // Persist Stage 01 Audit Record
    await AuditLog.create({
      transactionId: id,
      stage: 'classification',
      classifierInput: { amount: tx.amount, failureType: tx.failureType, metadata: tx.metadata },
      classifierOutput,
      timestamp: new Date()
    }).catch(e => console.error(`[AuditLog] Stage 01 error: ${e.message}`));

    // ── Step 2: Decision bounds ───────────────────────────────────────────────
    step('decision', 'Applying active deterministic guardrails...');
    let finalAction, boundApplied, boundReason;
    try {
      ({ finalAction, boundApplied, boundReason } = await applyDecisionBounds(tx, classifierOutput, customGuardrails));
      if (boundApplied) {
        step('decision', `Policy override [${boundApplied}]: ${boundReason} → final: ${finalAction.replace(/_/g, ' ')}`);
      } else {
        step('decision', `Guardrails verified clear → action: ${finalAction.replace(/_/g, ' ')}`);
      }
    } catch (decErr) {
      step('decision', `Policy fallback — defaulting to flag for review`);
      finalAction = 'flag_ambiguous';
    }
    tx.finalAction = finalAction;

    // Persist Stage 02 Audit Record
    await AuditLog.create({
      transactionId: id,
      stage: 'decision',
      recommendedAction: classifierOutput.recommendedAction,
      finalAction,
      boundApplied: boundApplied || null,
      boundReason: boundReason || null,
      timestamp: new Date()
    }).catch(e => console.error(`[AuditLog] Stage 02 error: ${e.message}`));

    // ── Step 3: Execute ───────────────────────────────────────────────────────
    step('execute', `Executing action: ${finalAction.replace(/_/g, ' ')}`);
    let executionResult;
    try {
      executionResult = await executeAction(tx, finalAction);
      let successDetail = '';
      if (executionResult.details?.razorpayOrderId) {
        successDetail = `Created Razorpay Order ${executionResult.details.razorpayOrderId}`;
      } else if (executionResult.details?.paymentLinkId) {
        successDetail = `Created Razorpay Payment Link ${executionResult.details.paymentLinkId}`;
      } else if (executionResult.details?.message) {
        successDetail = executionResult.details.message;
      } else if (finalAction === 'escalate_manual') {
        successDetail = 'Forwarded to human specialist review queue';
      } else if (finalAction === 'flag_ambiguous') {
        successDetail = 'Flagged for supervisor diagnostics';
      } else {
        successDetail = 'Action executed successfully';
      }

      step('execute', executionResult.success
        ? `Success — ${successDetail}`
        : `Execution note — ${executionResult.error || 'Retry queued'}`);
    } catch (execErr) {
      step('execute', `Execution note: ${execErr.message}`);
      executionResult = { success: false, error: execErr.message, details: {} };
    }
    tx.executionResult = executionResult;
    tx.processedAt = new Date();

    // Persist Stage 03 Audit Record
    await AuditLog.create({
      transactionId: id,
      stage: 'execution',
      finalAction,
      executionSuccess: executionResult.success,
      executionDetails: executionResult.details,
      executionError: executionResult.error,
      timestamp: new Date()
    }).catch(e => console.error(`[AuditLog] Stage 03 error: ${e.message}`));

    // ── Determine final status ────────────────────────────────────────────────
    if (!executionResult.success) {
      tx.status = 'exception';
    } else if (finalAction === 'flag_ambiguous') {
      tx.status = 'flagged';
    } else if (finalAction === 'escalate_manual') {
      tx.status = 'exception';
    } else {
      tx.status = 'recovered';
    }

    await tx.save().catch(e => { throw new Error(`DB save (final): ${e.message}`); });
    const statusLabels = { recovered: 'Recovered', exception: 'Escalated to Review', flagged: 'Flagged Ambiguous', processing: 'Processing' };
    step('done', `Status confirmed: ${statusLabels[tx.status] || tx.status}`, { status: tx.status });

    return {
      transactionId: id,
      customerName: tx.customerName,
      amount: tx.amount,
      failureType: tx.failureType,
      finalAction,
      status: tx.status,
      reasoning: classifierOutput.reasoning,
      boundApplied: boundApplied || null,
      ok: true
    };

  } catch (err) {
    console.error(`[Batch][${id}] FATAL: ${err.message}`);
    try {
      tx.status = 'exception';
      tx.executionResult = { success: false, error: err.message, details: {} };
      await tx.save();
    } catch (_) {}
    return { transactionId: id, status: 'exception', error: err.message, ok: false };
  }
}

/**
 * Concurrency-limited parallel runner.
 */
async function runWithConcurrency(items, concurrency, fn) {
  const results = [];
  let idx = 0;
  async function worker() {
    while (idx < items.length) {
      const item = items[idx++];
      results.push(await fn(item));
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, worker));
  return results;
}

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/batch/guardrails — get current active guardrails
// ─────────────────────────────────────────────────────────────────────────────
router.get('/guardrails', (req, res) => {
  res.json({ guardrails: getGuardrails() });
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/batch/guardrails — update active guardrails
// ─────────────────────────────────────────────────────────────────────────────
router.post('/guardrails', (req, res) => {
  try {
    const updated = updateGuardrails(req.body);
    console.log('[Guardrails] Updated configuration:', updated);
    res.json({ message: 'Guardrails updated successfully', guardrails: updated });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/batch/guardrails/reset — reset guardrails to system defaults
// ─────────────────────────────────────────────────────────────────────────────
router.post('/guardrails/reset', (req, res) => {
  const defaults = resetGuardrailsToDefault();
  res.json({ message: 'Guardrails reset to default values', guardrails: defaults });
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/batch/reset — reset all transactions & clear audit logs for re-testing
// ─────────────────────────────────────────────────────────────────────────────
router.post('/reset', async (req, res) => {
  try {
    batchProgress = null; // Clear any existing batch locks
    const { generateSyntheticTransactions } = require('../data/syntheticDataGenerator');
    
    // Wipe old transactions and re-seed with guaranteed unique enterprise & customer names
    await Transaction.deleteMany({});
    const newRecords = generateSyntheticTransactions();
    await Transaction.insertMany(newRecords);

    const deleteRes = await AuditLog.deleteMany({});
    const PromiseToPay = require('../models/PromiseToPay');
    await PromiseToPay.deleteMany({});

    console.log(`[Batch] Reset complete: ${newRecords.length} unique txns seeded, ${deleteRes.deletedCount} audit logs cleared.`);
    res.json({
      message: 'Pipeline reset successfully with fresh unique transactions. Ready for a new batch test run.',
      resetTransactionsCount: newRecords.length,
      clearedLogsCount: deleteRes.deletedCount
    });
  } catch (err) {
    res.status(500).json({ error: `Reset failed: ${err.message}` });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/batch/progress — poll for live status during a run
// ─────────────────────────────────────────────────────────────────────────────
router.get('/progress', (req, res) => {
  res.json(batchProgress || { running: false });
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/batch/run
// ─────────────────────────────────────────────────────────────────────────────
router.post('/run', async (req, res) => {
  // Prevent double runs
  if (batchProgress?.running) {
    return res.status(409).json({ error: 'A batch is already running. Wait for it to complete.' });
  }

  // Optional custom guardrails passed in request body
  const customGuardrails = req.body?.guardrails ? updateGuardrails(req.body.guardrails) : getGuardrails();

  let transactions;
  try {
    transactions = await Transaction.find({ status: 'pending' });
  } catch (dbErr) {
    console.error('[Batch] Failed to fetch transactions:', dbErr.message);
    return res.status(500).json({ error: `Database error: ${dbErr.message}` });
  }

  if (transactions.length === 0) {
    return res.json({
      message: 'No pending transactions to process.',
      processed: 0,
      summary: { total: 0, recovered: 0, escalated: 0, flagged: 0, errors: 0 },
      results: [],
      guardrails: customGuardrails
    });
  }

  console.log(`[Batch] ═══ Starting run: ${transactions.length} transactions, concurrency=${CONCURRENCY} ═══`);
  console.log('[Batch] Active Guardrails:', customGuardrails);

  // Init progress tracking
  const events = [];
  setBatchProgress({
    running: true,
    total: transactions.length,
    processed: 0,
    recovered: 0,
    escalated: 0,
    flagged: 0,
    events,
    guardrails: customGuardrails
  });

  const onEvent = (evt) => {
    events.push(evt);
    if (events.length > 200) events.shift(); // cap memory

    // Update counts on 'done' events
    if (evt.stage === 'done' && batchProgress) {
      batchProgress.processed++;
      if (evt.status === 'recovered') {
        batchProgress.recovered++;
      } else if (evt.status === 'flagged') {
        batchProgress.flagged++;
      } else {
        batchProgress.escalated++;
      }
    }
  };

  try {
    const results = await runWithConcurrency(transactions, CONCURRENCY, tx => processTx(tx, onEvent, customGuardrails));

    const summary = {
      total: results.length,
      recovered: results.filter(r => r.status === 'recovered').length,
      escalated: results.filter(r => r.status === 'exception').length,
      flagged: results.filter(r => r.status === 'flagged').length,
      errors: results.filter(r => !r.ok).length,
      guardrailsUsed: customGuardrails
    };

    console.log(`[Batch] ═══ Complete: recovered=${summary.recovered}, escalated=${summary.escalated}, flagged=${summary.flagged}, errors=${summary.errors} ═══`);
    setBatchProgress(null);

    return res.json({ message: 'Batch complete', summary, results, guardrails: customGuardrails });

  } catch (err) {
    console.error('[Batch] Unexpected fatal error:', err);
    setBatchProgress(null);
    return res.status(500).json({ error: `Batch fatal error: ${err.message}` });
  }
});

module.exports = router;
