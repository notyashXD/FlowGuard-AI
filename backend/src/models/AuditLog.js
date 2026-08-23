const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  transactionId: { type: String, required: true, index: true },
  stage: {
    type: String,
    enum: ['classification', 'decision', 'execution'],
    required: true
  },
  timestamp: { type: Date, default: Date.now },

  // Classification stage
  classifierInput: { type: mongoose.Schema.Types.Mixed },
  classifierOutput: { type: mongoose.Schema.Types.Mixed },
  classifierError: { type: String },

  // Decision stage
  boundApplied: { type: String }, // e.g. "max_retries_exceeded", "age_exceeded", "high_value"
  boundReason: { type: String },
  recommendedAction: { type: String },
  finalAction: { type: String },

  // Execution stage
  executionSuccess: { type: Boolean },
  executionDetails: { type: mongoose.Schema.Types.Mixed },
  executionError: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('AuditLog', auditLogSchema);
