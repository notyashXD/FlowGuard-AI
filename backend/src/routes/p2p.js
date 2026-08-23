const express = require('express');
const router = express.Router();
const PromiseToPay = require('../models/PromiseToPay');
const Transaction = require('../models/Transaction');

// Initial seed helper if table is empty
async function seedInitialPromises() {
  const count = await PromiseToPay.countDocuments();
  if (count === 0) {
    const txs = await Transaction.find({}).limit(8).lean();
    if (txs.length > 0) {
      const samplePromises = [
        {
          promiseId: 'P2P-8901',
          transactionId: txs[0].transactionId,
          customerName: txs[0].customerName,
          amount: txs[0].amount,
          promisedDate: new Date(Date.now() + 2 * 86400000),
          channel: 'voice_agent',
          status: 'active',
          notes: 'Customer confirmed verbally during Hinglish voice recovery call. Scheduled payment for Saturday.'
        },
        {
          promiseId: 'P2P-8902',
          transactionId: txs[1]?.transactionId || 'TXN-CA-DEMO1',
          customerName: txs[1]?.customerName || 'Aarav Sharma',
          amount: txs[1]?.amount || 8500,
          promisedDate: new Date(Date.now() - 1 * 86400000),
          channel: 'whatsapp',
          status: 'fulfilled',
          notes: 'Customer clicked WhatsApp link on promised date and completed UPI settlement.',
          fulfilledAt: new Date()
        },
        {
          promiseId: 'P2P-8903',
          transactionId: txs[2]?.transactionId || 'TXN-OR-DEMO2',
          customerName: txs[2]?.customerName || 'TechVentures Pvt Ltd',
          amount: txs[2]?.amount || 42000,
          promisedDate: new Date(Date.now() - 3 * 86400000),
          channel: 'email',
          status: 'broken',
          notes: 'B2B invoice commitment missed. Auto-escalated to manual collections specialist.'
        },
        {
          promiseId: 'P2P-8904',
          transactionId: txs[3]?.transactionId || 'TXN-SF-DEMO3',
          customerName: txs[3]?.customerName || 'Sneha Reddy',
          amount: txs[3]?.amount || 2499,
          promisedDate: new Date(Date.now() + 5 * 86400000),
          channel: 'voice_agent',
          status: 'active',
          notes: 'Customer requested retry after monthly salary credit on the 1st.'
        }
      ];
      await PromiseToPay.insertMany(samplePromises);
    }
  }
}

/**
 * GET /api/p2p
 * List promises + summary stats
 */
router.get('/', async (req, res) => {
  try {
    await seedInitialPromises();
    const promises = await PromiseToPay.find({}).sort({ createdAt: -1 }).lean();

    const totalPromised = promises.reduce((sum, p) => sum + p.amount, 0);
    const active = promises.filter(p => p.status === 'active');
    const fulfilled = promises.filter(p => p.status === 'fulfilled');
    const broken = promises.filter(p => p.status === 'broken');

    const totalSettled = fulfilled.reduce((sum, p) => sum + p.amount, 0);
    const fulfillmentRate = promises.length > 0
      ? parseFloat(((fulfilled.length / (fulfilled.length + broken.length || 1)) * 100).toFixed(1))
      : 0;

    res.json({
      summary: {
        totalPromised,
        totalSettled,
        activeCount: active.length,
        fulfilledCount: fulfilled.length,
        brokenCount: broken.length,
        fulfillmentRate
      },
      promises
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/p2p
 * Create a new promise commitment
 */
router.post('/', async (req, res) => {
  try {
    const { transactionId, customerName, amount, promisedDate, channel, notes } = req.body;
    const promiseId = `P2P-${Math.floor(1000 + Math.random() * 9000)}`;

    const newPromise = await PromiseToPay.create({
      promiseId,
      transactionId,
      customerName,
      amount,
      promisedDate: new Date(promisedDate),
      channel: channel || 'voice_agent',
      status: 'active',
      notes: notes || 'Customer verbal commitment captured by recovery agent'
    });

    res.json({ message: 'Promise to pay commitment recorded', promise: newPromise });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * POST /api/p2p/:id/fulfill
 * Mark promise as fulfilled
 */
router.post('/:id/fulfill', async (req, res) => {
  try {
    const promise = await PromiseToPay.findOneAndUpdate(
      { promiseId: req.params.id },
      { $set: { status: 'fulfilled', fulfilledAt: new Date(), updatedAt: new Date() } },
      { new: true }
    );
    if (!promise) return res.status(404).json({ error: 'Promise not found' });
    res.json({ message: 'Promise marked as fulfilled', promise });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/p2p/:id/escalate
 * Mark promise as broken / escalate
 */
router.post('/:id/escalate', async (req, res) => {
  try {
    const promise = await PromiseToPay.findOneAndUpdate(
      { promiseId: req.params.id },
      { $set: { status: 'broken', updatedAt: new Date() } },
      { new: true }
    );
    if (!promise) return res.status(404).json({ error: 'Promise not found' });
    res.json({ message: 'Promise marked as broken / escalated', promise });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
