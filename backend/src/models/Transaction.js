const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  transactionId: { type: String, required: true, unique: true },
  customerName: { type: String, required: true },
  customerContact: {
    email: { type: String },
    phone: { type: String }
  },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'INR' },
  failureType: {
    type: String,
    enum: ['payment_degradation', 'checkout_abandonment', 'subscription_failure', 'overdue_receivable'],
    required: true
  },
  failureTimestamp: { type: Date, required: true },
  attemptCount: { type: Number, default: 1 },
  metadata: { type: mongoose.Schema.Types.Mixed },

  // Pipeline results
  status: {
    type: String,
    enum: ['pending', 'recovered', 'exception', 'flagged', 'processing'],
    default: 'pending'
  },
  classifierOutput: {
    rootCause: String,
    confidence: String,
    recommendedAction: String,
    reasoning: String
  },
  finalAction: {
    type: String,
    enum: ['retry_payment', 'send_payment_link', 'escalate_manual', 'flag_ambiguous', null],
    default: null
  },
  executionResult: {
    success: Boolean,
    details: mongoose.Schema.Types.Mixed,
    error: String
  },
  razorpayOrderId: String,
  razorpayPaymentLinkId: String,
  razorpayPaymentLinkUrl: String,
  processedAt: Date
}, { timestamps: true });

module.exports = mongoose.model('Transaction', transactionSchema);
