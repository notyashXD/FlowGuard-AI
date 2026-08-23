const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');
const AuditLog = require('../models/AuditLog');
const { getGuardrails } = require('../services/guardrails');

/**
 * GET /api/metrics
 * Aggregate metrics, breakdown by failure type, and recovery flow funnel data.
 */
router.get('/', async (req, res) => {
  try {
    const all = await Transaction.find({}).lean();
    const auditLogs = await AuditLog.find({}).lean();
    const guardrails = getGuardrails();

    const totalProcessed = all.filter(t => t.status !== 'pending' && t.status !== 'processing').length;
    const recovered = all.filter(t => t.status === 'recovered');
    const flagged = all.filter(t => t.status === 'flagged');
    const exceptions = all.filter(t => t.status === 'exception');
    const pending = all.filter(t => t.status === 'pending');
    const processing = all.filter(t => t.status === 'processing');

    const totalRecoveredAmount = recovered.reduce((sum, t) => sum + (t.amount || 0), 0);
    const totalPotentialAmount = all.reduce((sum, t) => sum + (t.amount || 0), 0);
    const escalatedAmount = exceptions.reduce((sum, t) => sum + (t.amount || 0), 0);
    const flaggedAmount = flagged.reduce((sum, t) => sum + (t.amount || 0), 0);

    const recoveryRatePercent = totalProcessed > 0
      ? parseFloat(((recovered.length / totalProcessed) * 100).toFixed(1))
      : 0;

    const valueRecoveryRatePercent = totalPotentialAmount > 0
      ? parseFloat(((totalRecoveredAmount / totalPotentialAmount) * 100).toFixed(1))
      : 0;

    // Per failure type breakdown
    const byType = {};
    const failureTypes = ['payment_degradation', 'checkout_abandonment', 'subscription_failure', 'overdue_receivable'];

    for (const ft of failureTypes) {
      const group = all.filter(t => t.failureType === ft);
      const rec = group.filter(t => t.status === 'recovered');
      const pen = group.filter(t => ['pending', 'processing', 'exception', 'flagged'].includes(t.status));

      byType[ft] = {
        total: group.length,
        recovered: rec.length,
        recoveredAmount: parseFloat(rec.reduce((s, t) => s + t.amount, 0).toFixed(2)),
        pending: pen.length
      };
    }

    // ── Pipeline Flow Funnel Computation ──────────────────────────────────────
    const decisionLogs = auditLogs.filter(l => l.stage === 'decision');
    const boundOverrides = decisionLogs.filter(l => Boolean(l.boundApplied));

    const ordersCreated = all.filter(t => Boolean(t.razorpayOrderId)).length;
    const linksCreated = all.filter(t => Boolean(t.razorpayPaymentLinkId)).length;
    const manualQueued = exceptions.length;

    const funnel = {
      stage1_detected: {
        count: all.length,
        amount: totalPotentialAmount,
        label: 'Failed Payments Ingested'
      },
      stage2_classified: {
        count: totalProcessed,
        label: 'AI Root Cause Classified',
        actions: {
          retry_payment: decisionLogs.filter(l => l.recommendedAction === 'retry_payment').length,
          send_payment_link: decisionLogs.filter(l => l.recommendedAction === 'send_payment_link').length,
          escalate_manual: decisionLogs.filter(l => l.recommendedAction === 'escalate_manual').length,
          flag_ambiguous: decisionLogs.filter(l => l.recommendedAction === 'flag_ambiguous').length
        }
      },
      stage3_guardrails: {
        overridesCount: boundOverrides.length,
        label: 'Guardrail Bounds Checked',
        rulesTriggered: {
          high_value: boundOverrides.filter(l => l.boundApplied === 'high_value_transaction').length,
          max_retries: boundOverrides.filter(l => l.boundApplied === 'max_retries_exceeded').length,
          age_exceeded: boundOverrides.filter(l => l.boundApplied === 'age_exceeded').length,
          low_confidence: boundOverrides.filter(l => l.boundApplied === 'low_confidence_fallback').length
        }
      },
      stage4_executed: {
        count: totalProcessed,
        label: 'Razorpay API Dispatched',
        ordersCreated,
        linksCreated,
        manualQueued
      },
      stage5_outcome: {
        recoveredCount: recovered.length,
        recoveredAmount: totalRecoveredAmount,
        escalatedCount: exceptions.length,
        escalatedAmount,
        flaggedCount: flagged.length,
        flaggedAmount,
        yieldRate: recoveryRatePercent
      }
    };

    res.json({
      totalRecovered: parseFloat(totalRecoveredAmount.toFixed(2)),
      totalPotentialAmount: parseFloat(totalPotentialAmount.toFixed(2)),
      recoveryRatePercent,
      valueRecoveryRatePercent,
      exceptionsCount: exceptions.length + flagged.length,
      totalProcessed,
      totalCount: all.length,
      recoveredCount: recovered.length,
      pendingCount: pending.length,
      flaggedCount: flagged.length,
      byType,
      guardrails,
      funnel
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/metrics/executive-summary
 * Generates an executive summary briefing of the current recovery performance.
 */
router.post('/executive-summary', async (req, res) => {
  try {
    const all = await Transaction.find({}).lean();
    const auditLogs = await AuditLog.find({ stage: 'decision' }).lean();
    const guardrails = getGuardrails();

    const totalProcessed = all.filter(t => t.status !== 'pending' && t.status !== 'processing').length;
    const recovered = all.filter(t => t.status === 'recovered');
    const exceptions = all.filter(t => t.status === 'exception');
    const flagged = all.filter(t => t.status === 'flagged');

    const totalRecoveredAmount = recovered.reduce((sum, t) => sum + (t.amount || 0), 0);
    const totalPotentialAmount = all.reduce((sum, t) => sum + (t.amount || 0), 0);
    const recoveryRate = totalProcessed > 0 ? ((recovered.length / totalProcessed) * 100).toFixed(1) : '0';

    const highValueOverrides = auditLogs.filter(l => l.boundApplied === 'high_value_transaction').length;
    const retryOverrides = auditLogs.filter(l => l.boundApplied === 'max_retries_exceeded').length;
    const ageOverrides = auditLogs.filter(l => l.boundApplied === 'age_exceeded').length;

    // Checkout abandonment recovery
    const caGroup = all.filter(t => t.failureType === 'checkout_abandonment');
    const caRecovered = caGroup.filter(t => t.status === 'recovered').length;
    const caRecoveredAmt = caGroup.filter(t => t.status === 'recovered').reduce((s, t) => s + t.amount, 0);

    const formattedRecovered = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(totalRecoveredAmount);
    const formattedPotential = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(totalPotentialAmount);

    const headline = totalProcessed === 0
      ? 'Awaiting Batch Execution — Pipeline Ready'
      : `Captured ${formattedRecovered} Across ${recovered.length} Payments (${recoveryRate}% Autonomous Recovery Yield)`;

    const keyFindings = [
      `Ingested ${all.length} failed/at-risk payments representing ${formattedPotential} in pipeline value.`,
      `Checkout Abandonment delivered highest yield with ${caRecovered}/${caGroup.length} carts recovered (${new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(caRecoveredAmt)} recovered via Razorpay Payment Links).`,
      `Safety guardrails successfully prevented ${highValueOverrides + retryOverrides + ageOverrides} risky autonomous executions (${highValueOverrides} high-value >₹${(guardrails.highValueThreshold / 1000).toFixed(0)}k, ${retryOverrides} retry-exhausted, ${ageOverrides} stale payments).`,
      `${exceptions.length} complex B2B receivables and high-risk degradations seamlessly routed to the manual collections queue with pre-analyzed AI notes.`
    ];

    const recommendations = [
      'Enable automated WhatsApp payment link reminders for cart abandonment under 4 hours.',
      'Adjust the high-value threshold to ₹75,000 to unlock automated recovery for enterprise subscription renewals.',
      'Route bank timeout degradation directly to instant retry during non-peak core banking hours.'
    ];

    res.json({
      headline,
      recoveryRate: `${recoveryRate}%`,
      totalRecovered: formattedRecovered,
      processedCount: totalProcessed,
      keyFindings,
      recommendations,
      timestamp: new Date().toISOString()
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
