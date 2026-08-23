# FlowGuard AI — Payment Recovery Engine
> **Razorpay Buildathon 2026** | Track: AI Revenue Recovery  
> Built by **[Yash Mishra](https://linkedin.com/in/ymishra1201)** · 🏆 IBM National Hackathon Winner 2026

[![Live Demo](https://img.shields.io/badge/🌐_Live_Demo-flowguard--ai.onrender.com-6366f1?style=for-the-badge)](https://flowguard-ai-xgmv.onrender.com)
[![GitHub](https://img.shields.io/badge/GitHub-notyashXD%2FFlowGuard--AI-181717?style=for-the-badge&logo=github)](https://github.com/notyashXD/FlowGuard-AI)
[![Track](https://img.shields.io/badge/Track-AI_Revenue_Recovery-00bfae?style=for-the-badge)](https://github.com/notyashXD/FlowGuard-AI)

![FlowGuard AI](assets/thumbnail.jpg)

---

## What is this?

I built FlowGuard AI for the Razorpay Buildathon 2026 to solve a problem I noticed while researching payment infrastructure — most systems do blind retries on failed payments. They don't know *why* the payment failed, they just keep hitting the same card until the bank blocks them or the customer churns.

FlowGuard takes a different approach: it uses an LLM to figure out *why* a payment failed, but doesn't let the AI actually do anything on its own. Every action goes through a hard-coded rules engine first — if the transaction is over ₹50k, has been tried 3+ times, or is older than a week, it gets escalated to a human. The AI only executes if all the safety checks pass.

> **The core idea: AI figures out what to do, rules decide if it's allowed to.**

---

## How it works

```
4 Input Streams (Gateway failures, Cart drops, Subscriptions, B2B invoices)
        ↓
Stage 1: Groq LLM classifies the failure and suggests an action
        ↓
Stage 2: Safety rules engine checks if the action is allowed
        ↓
Stage 3: Razorpay API executes the recovery (retry / payment link / escalate)
        ↓
Full audit log saved at every stage (for compliance)
```

The safety rules I built:
- **₹50,000 cap** — anything above this goes straight to human review, no exceptions
- **3 retry max** — stops hammering cards that keep declining
- **7 day cutoff** — old transactions aren't touched automatically
- **Low confidence fallback** — if the AI isn't sure, it flags for human review

---

## Features

**Recovery Engine**
- Batch ingests 54 synthetic failed transactions across 4 failure types
- Groq LLM (`allam-2-7b`) classifies each one in real time
- Live log stream shows every decision as it happens
- MongoDB stores the full 3-stage audit trail for each transaction

**Voice Outreach (Hinglish)**
- Calls customers with a conversational Hinglish script via Edge TTS
- Records verbal payment promises in a Promise-to-Pay ledger
- Tracks settlement dates and follow-up status

**Mandate & B2B Recovery**
- Reschedules subscription mandate retries around Indian salary dates (1st–5th of the month)
- Aging matrix for B2B invoices (Current / NET-30 / NET-60 / Overdue)

**Dashboard**
- Real-time KPIs with capital recovered, recovery rate, and funnel breakdown
- Compliance audit viewer per transaction
- Guardrails panel — all policy limits visible and adjustable

---

## Numbers (on the 54-transaction test set)

- ₹13,84,210 total capital at risk
- ~₹1,49,246 autonomously recovered
- 0% unsafe auto-retries (guardrails blocked all policy violations)

---

## Stack

- **Backend**: Node.js, Express, MongoDB Atlas, Mongoose
- **Frontend**: React 18, Vite, Tailwind CSS, Recharts, Framer Motion
- **AI**: Groq API with rate-limit backoff
- **Voice**: Microsoft Edge TTS (Neural, Hinglish)
- **Payments**: Razorpay Orders API + Hosted Payment Links

---

## Run it locally

```bash
git clone https://github.com/notyashXD/FlowGuard-AI.git
cd FlowGuard-AI
```

Set up your environment — create `backend/.env`:
```env
RAZORPAY_KEY_ID=rzp_test_your_key
RAZORPAY_KEY_SECRET=your_secret
GROQ_API_KEY=gsk_your_groq_key
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/recovery-agent
PORT=3001
```

Start both servers:
```bash
# Terminal 1 — backend
cd backend && npm install && npm run dev

# Terminal 2 — frontend
cd frontend && npm install && npm run dev
```

Open `http://localhost:5173`

---

## Deploy (free on Render)

1. Fork this repo
2. Go to [dashboard.render.com](https://dashboard.render.com) → New → Web Service
3. Connect `FlowGuard-AI`, set:
   - Build: `npm run build`
   - Start: `npm run start`
   - Instance: Free
4. Add your 5 env vars, hit deploy

---

## Project structure

```
FlowGuard-AI/
├── backend/
│   └── src/
│       ├── server.js
│       ├── models/          # Transaction, AuditLog, PromiseToPay schemas
│       ├── routes/          # batch, transactions, metrics, p2p, voice
│       ├── services/        # classifier, guardrails, razorpayExecutor
│       └── data/            # 54 synthetic test transactions
├── frontend/
│   └── src/
│       ├── pages/           # Dashboard, PaymentPortal
│       └── components/      # All UI panels and widgets
├── assets/
├── package.json             # Root build config
└── render.yaml              # Render deployment config
```

---

## About me

**Yash Mishra** — MCA student, full-stack developer, IBM National Hackathon Winner 2026

- LinkedIn: [ymishra1201](https://linkedin.com/in/ymishra1201)
- GitHub: [@notyashXD](https://github.com/notyashXD)
- Email: yashmishra1246@gmail.com
