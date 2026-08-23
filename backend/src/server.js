require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const { generateSyntheticTransactions } = require('./data/syntheticDataGenerator');
const Transaction = require('./models/Transaction');

const app = express();
const PORT = process.env.PORT || 3001;

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/batch', require('./routes/batch'));
app.use('/api/transactions', require('./routes/transactions'));
app.use('/api/metrics', require('./routes/metrics'));
app.use('/api/p2p', require('./routes/p2p'));
app.use('/api/sequencer', require('./routes/sequencer'));
app.use('/api/voice', require('./routes/voice'));

// ── Enhanced health check (DB + API key presence) ─────────────────────────────
app.get('/api/health', async (req, res) => {
  try {
    const dbState = mongoose.connection.readyState;
    // 0=disconnected, 1=connected, 2=connecting, 3=disconnecting
    const dbStateLabel = ['disconnected', 'connected', 'connecting', 'disconnecting'][dbState] || 'unknown';
    const dbHealthy = dbState === 1;

    const groqKeyPresent = !!process.env.GROQ_API_KEY && process.env.GROQ_API_KEY.length > 10;
    const razorpayKeyPresent = !!process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_ID.startsWith('rzp_');

    const txCount = dbHealthy ? await Transaction.countDocuments() : null;
    const pendingCount = dbHealthy ? await Transaction.countDocuments({ status: 'pending' }) : null;
    const processedCount = dbHealthy ? await Transaction.countDocuments({ status: { $in: ['recovered', 'exception', 'flagged'] } }) : null;

    const allHealthy = dbHealthy && groqKeyPresent && razorpayKeyPresent;

    res.status(allHealthy ? 200 : 503).json({
      status: allHealthy ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      services: {
        database: { status: dbStateLabel, healthy: dbHealthy },
        groqApi: { status: groqKeyPresent ? 'key_present' : 'missing', healthy: groqKeyPresent },
        razorpay: { status: razorpayKeyPresent ? 'key_present' : 'missing', healthy: razorpayKeyPresent },
      },
      data: {
        totalTransactions: txCount,
        pending: pendingCount,
        processed: processedCount,
      },
      model: 'allam-2-7b (via Groq)',
      version: '1.0.0'
    });
  } catch (err) {
    res.status(500).json({ status: 'error', error: err.message });
  }
});

// ── Progress endpoint for live batch tracking ─────────────────────────────────
app.get('/api/batch/progress', async (req, res) => {
  try {
    const counts = await Transaction.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    const map = {};
    counts.forEach(c => { map[c._id] = c.count; });
    res.json({
      pending: map.pending || 0,
      processing: map.processing || 0,
      recovered: map.recovered || 0,
      exception: map.exception || 0,
      flagged: map.flagged || 0,
      total: Object.values(map).reduce((a, b) => a + b, 0)
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Seed function ─────────────────────────────────────────────────────────────
async function seedDataIfEmpty() {
  const count = await Transaction.countDocuments();
  if (count === 0) {
    console.log('[Seed] No transactions found. Generating synthetic data...');
    const records = generateSyntheticTransactions();
    await Transaction.insertMany(records);
    console.log(`[Seed] Inserted ${records.length} synthetic transactions.`);
  } else {
    console.log(`[Seed] ${count} transactions already exist. Skipping seed.`);
  }
}

// ── Connect to MongoDB and start server ───────────────────────────────────────
async function start() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/recovery-agent');
    console.log('[MongoDB] Connected successfully.');
    await seedDataIfEmpty();
    app.listen(PORT, () => {
      console.log(`[Server] Recovery Agent running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('[Server] Startup failed:', err.message);
    process.exit(1);
  }
}

start();
