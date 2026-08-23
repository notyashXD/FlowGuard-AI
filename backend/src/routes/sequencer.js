const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');

const bankSwitches = [
  { bank: 'HDFC Bank', code: 'HDFC', uptime: 99.4, latencyMs: 180, status: 'optimal', successRate: '92.4%', volume: '₹4.2L' },
  { bank: 'ICICI Bank', code: 'ICICI', uptime: 98.9, latencyMs: 210, status: 'optimal', successRate: '90.1%', volume: '₹3.8L' },
  { bank: 'State Bank of India', code: 'SBI', uptime: 94.2, latencyMs: 580, status: 'degraded', successRate: '78.5%', volume: '₹2.9L' },
  { bank: 'Axis Bank', code: 'UTIB', uptime: 97.8, latencyMs: 240, status: 'optimal', successRate: '88.3%', volume: '₹2.1L' },
  { bank: 'Kotak Mahindra', code: 'KKBK', uptime: 98.6, latencyMs: 195, status: 'optimal', successRate: '89.7%', volume: '₹1.6L' },
];

/**
 * GET /api/sequencer
 * Mandate sequencer state, bank switch health, and scheduling matrix
 */
router.get('/', async (req, res) => {
  try {
    const subscriptions = await Transaction.find({ failureType: 'subscription_failure' }).lean();

    const scheduledSequences = subscriptions.map((tx, i) => {
      const isSalaryCycle = i % 2 === 0;
      const recommendedDate = new Date();
      recommendedDate.setDate(recommendedDate.getDate() + (isSalaryCycle ? 3 : 1));
      recommendedDate.setHours(3, 30, 0, 0); // 03:30 AM optimal off-peak window

      return {
        transactionId: tx.transactionId,
        customerName: tx.customerName,
        planName: tx.metadata?.planName || 'Enterprise Subscription',
        amount: tx.amount,
        mandateId: tx.metadata?.mandateId || `MAND-${Math.floor(100000 + Math.random() * 900000)}`,
        currentAttempt: tx.attemptCount,
        recommendedSwitch: tx.metadata?.bankName === 'SBI' ? 'HDFC (Auto-Rerouted)' : (tx.metadata?.bankName || 'HDFC'),
        strategy: isSalaryCycle ? 'Salary Day Window (1st-5th)' : 'Off-Peak Core Switch (03:30 IST)',
        scheduledDate: recommendedDate.toISOString(),
        predictedSuccessRate: '94.2%'
      };
    });

    res.json({
      bankSwitches,
      scheduledCount: scheduledSequences.length,
      scheduledSequences: scheduledSequences.slice(0, 10)
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
