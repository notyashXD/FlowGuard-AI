// In-memory guardrails configuration with persistent defaults
let currentGuardrails = {
  maxRetryAttempts: 3,
  maxAgeDays: 7,
  highValueThreshold: 50000,
  lowConfidenceFallback: true,
  autoPaymentLinkForAbandonment: true
};

function getGuardrails() {
  return { ...currentGuardrails };
}

function updateGuardrails(newConfig) {
  currentGuardrails = {
    ...currentGuardrails,
    ...newConfig,
    maxRetryAttempts: Number(newConfig.maxRetryAttempts ?? currentGuardrails.maxRetryAttempts),
    maxAgeDays: Number(newConfig.maxAgeDays ?? currentGuardrails.maxAgeDays),
    highValueThreshold: Number(newConfig.highValueThreshold ?? currentGuardrails.highValueThreshold),
    lowConfidenceFallback: Boolean(newConfig.lowConfidenceFallback ?? currentGuardrails.lowConfidenceFallback),
    autoPaymentLinkForAbandonment: Boolean(newConfig.autoPaymentLinkForAbandonment ?? currentGuardrails.autoPaymentLinkForAbandonment)
  };
  return getGuardrails();
}

function resetGuardrailsToDefault() {
  currentGuardrails = {
    maxRetryAttempts: 3,
    maxAgeDays: 7,
    highValueThreshold: 50000,
    lowConfidenceFallback: true,
    autoPaymentLinkForAbandonment: true
  };
  return getGuardrails();
}

module.exports = {
  getGuardrails,
  updateGuardrails,
  resetGuardrailsToDefault
};
