const mongoose = require('mongoose');

const PromiseToPaySchema = new mongoose.Schema({
  promiseId: { type: String, required: true, unique: true },
  transactionId: { type: String, required: true },
  customerName: { type: String, required: true },
  amount: { type: Number, required: true },
  promisedDate: { type: Date, required: true },
  channel: { type: String, enum: ['voice_agent', 'whatsapp', 'email', 'sms', 'manual_agent'], default: 'voice_agent' },
  status: { type: String, enum: ['active', 'fulfilled', 'broken', 'escalated'], default: 'active' },
  notes: { type: String },
  fulfilledAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('PromiseToPay', PromiseToPaySchema);
