const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');
const AuditLog = require('../models/AuditLog');
const { generateRecoveryMessages } = require('../services/messageGenerator');

/**
 * GET /api/transactions
 * List all transactions with current status, action, and outcome.
 */
router.get('/', async (req, res) => {
  try {
    const transactions = await Transaction.find({})
      .sort({ failureTimestamp: -1 })
      .lean();

    res.json(transactions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/transactions/:id
 * Retrieve single transaction by transactionId or MongoDB ObjectId.
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    let transaction = await Transaction.findOne({ transactionId: id }).lean();
    if (!transaction) {
      const cleanId = id.replace(/^rec_/i, '').replace(/[^a-zA-Z0-9]/g, '');
      transaction = await Transaction.findOne({
        $or: [
          { transactionId: new RegExp(id, 'i') },
          { transactionId: new RegExp(cleanId, 'i') },
          { razorpayPaymentLinkId: id }
        ]
      }).lean();
    }
    if (!transaction && id.match(/^[0-9a-fA-F]{24}$/)) {
      transaction = await Transaction.findById(id).lean();
    }
    if (!transaction) {
      return res.status(404).json({ error: `Transaction ${id} not found` });
    }
    res.json({ transaction, ...transaction });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/transactions/:id/recover
 * Instant customer payment settlement (marks transaction as recovered).
 */
router.post('/:id/recover', async (req, res) => {
  try {
    const { id } = req.params;
    let transaction = await Transaction.findOne({ transactionId: id });
    if (!transaction) {
      const cleanId = id.replace(/^rec_/i, '').replace(/[^a-zA-Z0-9]/g, '');
      transaction = await Transaction.findOne({
        $or: [
          { transactionId: new RegExp(id, 'i') },
          { transactionId: new RegExp(cleanId, 'i') },
          { razorpayPaymentLinkId: id }
        ]
      });
    }
    if (!transaction && id.match(/^[0-9a-fA-F]{24}$/)) {
      transaction = await Transaction.findById(id);
    }
    if (!transaction) {
      return res.status(404).json({ error: `Transaction ${id} not found` });
    }

    transaction.status = 'recovered';
    transaction.finalAction = transaction.finalAction || 'send_payment_link';
    transaction.recoveredAt = new Date();
    await transaction.save();

    await AuditLog.create({
      transactionId: transaction.transactionId,
      stage: 'execution',
      finalAction: transaction.finalAction,
      executionSuccess: true,
      executionDetails: {
        action: 'settlement_success',
        settlementMethod: 'Razorpay Checkout / Payment Portal',
        settledAmount: transaction.amount,
        settledAt: new Date().toISOString()
      }
    });

    res.json({ success: true, transaction });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/transactions/:id/audit
 * Full audit trail for one transaction + generated recovery communication previews.
 */
router.get('/:id/audit', async (req, res) => {
  try {
    const { id } = req.params;

    const transaction = await Transaction.findOne({ transactionId: id }).lean();
    if (!transaction) {
      return res.status(404).json({ error: `Transaction ${id} not found` });
    }

    const auditLogs = await AuditLog.find({ transactionId: id })
      .sort({ timestamp: 1 })
      .lean();

    const messages = generateRecoveryMessages(transaction);

    res.json({ transaction, auditLogs, messages });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/transactions/:id/messages
 * Direct endpoint for recovery messages preview
 */
router.get('/:id/messages', async (req, res) => {
  try {
    const { id } = req.params;
    const transaction = await Transaction.findOne({ transactionId: id }).lean();
    if (!transaction) {
      return res.status(404).json({ error: `Transaction ${id} not found` });
    }
    const messages = generateRecoveryMessages(transaction);
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
