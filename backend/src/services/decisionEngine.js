const AuditLog = require('../models/AuditLog');
const { getGuardrails } = require('./guardrails');

/**
 * Apply hard bounds to the classifier's recommendation using current live guardrails.
 * Every decision is written to AuditLog BEFORE execution.
 *
 * @param {Object} transaction - Mongoose transaction document
 * @param {Object} classifierOutput - Output from classifier.js
 * @param {Object} [customGuardrails] - Optional override guardrails
 * @returns {{ finalAction: string, boundApplied: string|null, boundReason: string|null }}
 */
async function applyDecisionBounds(transaction, classifierOutput, customGuardrails = null) {
  const guardrails = customGuardrails || getGuardrails();
  const { recommendedAction, confidence } = classifierOutput;
  let finalAction = recommendedAction;
  let boundApplied = null;
  let boundReason = null;

  // ── BOUND 1: Max retry attempts ───────────────────────────────────────────
  if (
    finalAction === 'retry_payment' &&
    transaction.attemptCount >= guardrails.maxRetryAttempts
  ) {
    finalAction = 'escalate_manual';
    boundApplied = 'max_retries_exceeded';
    boundReason = `Attempt count ${transaction.attemptCount} reaches/exceeds configured guardrail (max: ${guardrails.maxRetryAttempts} retries). Auto-routing to human collection.`;
  }

  // ── BOUND 2: Age limit — no automated action on stale transactions ─────────
  const ageMs = Date.now() - new Date(transaction.failureTimestamp).getTime();
  const ageDays = ageMs / (1000 * 60 * 60 * 24);

  if (
    ageDays > guardrails.maxAgeDays &&
    !['escalate_manual', 'flag_ambiguous'].includes(finalAction)
  ) {
    finalAction = 'escalate_manual';
    boundApplied = boundApplied || 'age_exceeded';
    boundReason = boundReason || `Transaction is ${Math.floor(ageDays)} days old (configured guardrail: max ${guardrails.maxAgeDays} days for autonomous recovery). Escalated to manual review.`;
  }

  // ── BOUND 3: High-value transactions always require human sign-off ─────────
  if (
    transaction.amount > guardrails.highValueThreshold &&
    !['escalate_manual', 'flag_ambiguous'].includes(finalAction)
  ) {
    finalAction = 'escalate_manual';
    boundApplied = boundApplied || 'high_value_transaction';
    boundReason = boundReason || `Transaction amount ₹${transaction.amount.toLocaleString('en-IN')} exceeds active guardrail limit of ₹${guardrails.highValueThreshold.toLocaleString('en-IN')}. Protected against automated retries.`;
  }

  // ── BOUND 4: Low confidence fallback ─────────────────────────────────────
  if (
    guardrails.lowConfidenceFallback &&
    confidence === 'low' &&
    finalAction === 'retry_payment'
  ) {
    finalAction = 'flag_ambiguous';
    boundApplied = boundApplied || 'low_confidence_fallback';
    boundReason = boundReason || 'AI confidence score is LOW. Active guardrail prevents blind retry on uncertain failure signals.';
  }

  // ── Write decision audit log BEFORE execution ─────────────────────────────
  await AuditLog.create({
    transactionId: transaction.transactionId,
    stage: 'decision',
    classifierOutput,
    recommendedAction,
    boundApplied,
    boundReason,
    finalAction,
    guardrailsSnapshot: guardrails
  });

  return { finalAction, boundApplied, boundReason };
}

module.exports = { applyDecisionBounds };
