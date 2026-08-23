# FlowGuard AI — Autonomous Revenue Defense & Recovery Engine
> **Razorpay Buildathon 2026 Submission** | **Track:** AI Revenue Recovery  
> Built by **[Yash Mishra](https://linkedin.com/in/ymishra1201)** (🏆 IBM Hackathon Winner)

![FlowGuard AI Thumbnail](docs/thumbnail.jpg)

---

## ⚡ Executive Summary

Failed payments, checkout drop-offs, and overdue B2B receivables cost Indian digital businesses billions annually. Standard payment recovery architectures rely on **dumb blind retries** that hammer customer cards, increase bank authorization penalties, annoy cardholders into churning, and risk gateway rate blocks.

**FlowGuard AI** introduces a bounded, autonomous revenue recovery engine built on a foundational FinTech principle:
> **AI diagnoses and recommends, but deterministic financial guardrails decide and execute.**

---

## 🏗️ Architecture & Pipeline Flow

FlowGuard evaluates payment failures through a 3-stage auditable pipeline:

```
                               ┌────────────────────────┐
                               │ 4 Ingestion Streams    │
                               │ • Payment Degradation  │
                               │ • Cart Abandonment     │
                               │ • Subscription Mandate │
                               │ • B2B Net-30 Invoices  │
                               └───────────┬────────────┘
                                           │
                                           ▼
                    ┌──────────────────────────────────────────────┐
                    │ Stage 01: Groq LLM Root Cause Diagnosis      │
                    │ • Categorizes true failure failure pattern   │
                    │ • Evaluates confidence (high / med / low)    │
                    │ • Proposes recommended recovery action       │
                    └──────────────────────┬───────────────────────┘
                                           │
                                           ▼
                    ┌──────────────────────────────────────────────┐
                    │ Stage 02: Deterministic Safety Guardrails    │
                    │ • High-Value Ceiling: > ₹50,000 → Human Queue│
                    │ • Max Retries: Attempt ≥ 3 → Hard Escalation │
                    │ • Stale Age: > 7 Days → Policy Override      │
                    │ • Low-Confidence Fallback: < 0.75 → Review   │
                    └──────────────────────┬───────────────────────┘
                                           │
                                           ▼
                    ┌──────────────────────────────────────────────┐
                    │ Stage 03: Multi-Channel Razorpay Execution   │
                    │ • Razorpay Test-Mode Orders API              │
                    │ • Hosted Razorpay Recovery Payment Links     │
                    │ • RBI E-Mandate Salary-Cycle Sequencer       │
                    │ • Conversational Hinglish Voice AI (Edge TTS)│
                    │ • Promise-to-Pay (P2P) Fulfillment Tracker   │
                    └──────────────────────┬───────────────────────┘
                                           │
                                           ▼
                    ┌──────────────────────────────────────────────┐
                    │ Immutable MongoDB Audit Trail (Compliance)   │
                    └──────────────────────────────────────────────┘
```

---

## ✨ Core Innovations & Features

### 1. 🛡️ Deterministic Guardrails Engine (Safety-First FinTech)
AI models must never be given unrestricted access to charge customer cards or initiate arbitrary payment links. FlowGuard enforces hard policy boundaries in memory and persists guardrail overrides:
* **High-Value Cap**: Any transaction exceeding ₹50,000 is automatically blocked from auto-retry and routed to a human review desk.
* **Max Retry Cap**: Transactions with $\ge 3$ previous attempts are automatically escalated to avoid cardholder friction.
* **Stale Age Protection**: Failures older than 7 days are protected from surprise automated deductions.

### 2. 🎙️ Conversational Hinglish Voice AI & Promise-to-Pay (P2P) Tracker
Over 60% of Indian digital consumers respond far better to polite vernacular conversational outreach than cold transactional emails. 
* Powered by Edge TTS neural speech synthesis, FlowGuard calls customers, explains why their payment failed in natural Hinglish (*"Namaste, main Razorpay automated recovery desk se..."*), and secures a verbal **Promise-to-Pay (P2P)** date.
* Verbal and digital commitments are logged in a real-time **Promise-to-Pay Ledger** with agent transcripts, promised settlement dates, and one-click fulfillment tracking.

### 3. 📅 Mandate Retry Sequencer (RBI E-Mandate Compliance)
Recurring subscription mandate drops are automatically rescheduled around Indian salary liquidity windows (1st–5th of the month) with exponential cooling periods to maximize authorization success while adhering to RBI circulars.

### 4. 🏢 B2B Receivables Chaser (DSO & Aging Buckets)
Categorizes enterprise receivables into aging buckets (Current, NET-30, NET-60, 60+ Days Overdue) with automated GST-compliant reminder notices and escalated account manager routing.

### 5. 🔍 3-Stage Immutable Compliance Audit Trail
Every transaction maintains an auditable paper trail:
1. `classification`: Raw failure metadata, LLM confidence score, and root-cause rationale.
2. `decision`: Exact deterministic guardrail policy evaluated and applied.
3. `execution`: Razorpay Order ID, Payment Link ID, or escalation timestamp.

---

## 📊 Live Benchmark Metrics

Across our standardized evaluation dataset of 54 representative failure payloads (totaling **₹13,84,210** capital at risk):
* **Autonomous Recovery Yield**: **+₹1,49,246+** capital recovered without human intervention.
* **Autonomous Action Rate**: ~24.1% auto-recovered, ~74.1% safely routed to human review by guardrail policies.
* **Unsafe Autoretry Rate**: **0.0%** (100% of high-value and stale transactions caught by deterministic bounds).
* **Live Telemetry Frequency**: 700ms real-time parallel polling across batch progress, metrics, and transaction status.

---

## 🛠️ Tech Stack

* **Backend**: Node.js, Express, Mongoose, MongoDB Atlas
* **Frontend**: React 18, Vite, Tailwind CSS, Framer Motion, Recharts, Lucide Icons
* **AI Inference**: Groq (`allam-2-7b`) with dynamic exponential backoff jitter & rate-limit handling
* **Voice Engine**: Edge TTS Neural Speech Synthesis
* **Payment Gateway**: Razorpay Node.js SDK (Test-Mode Gateway & Hosted Payment Links)

---

## 🚀 Getting Started

### Prerequisites
* Node.js 18+ and npm
* MongoDB Atlas connection string (or local MongoDB on `localhost:27017`)
* Groq API Key (Free tier supported)
* Razorpay Test Mode Key & Secret

### 1. Clone & Configure

```bash
git clone https://github.com/notyashXD/FlowGuard-AI.git
cd FlowGuard-AI
```

Configure backend environment variables:
```bash
cd backend
cp .env.example .env
```

Edit `backend/.env`:
```env
RAZORPAY_KEY_ID=rzp_test_your_test_key
RAZORPAY_KEY_SECRET=your_test_secret
GROQ_API_KEY=gsk_your_groq_api_key
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/recovery-agent?retryWrites=true&w=majority
PORT=3001
FRONTEND_URL=http://localhost:5173
```

### 2. Run Locally

```bash
# Terminal 1: Backend Server (runs on http://localhost:3001)
cd backend
npm install
npm run dev

# Terminal 2: Frontend Dev Server (runs on http://localhost:5173)
cd ../frontend
npm install
npm run dev
```

Open your browser at **`http://localhost:5173`** to access the FlowGuard AI Control Center.

---

## 📂 Project Structure

```
FlowGuard-AI/
├── backend/
│   ├── .env.example                     # Environment template (no secrets)
│   ├── package.json
│   └── src/
│       ├── server.js                    # Express app entry & DB connection
│       ├── models/
│       │   ├── Transaction.js           # Transaction & failure payload schema
│       │   ├── AuditLog.js              # 3-stage audit record schema
│       │   └── PromiseToPay.js          # P2P commitment schema
│       ├── routes/
│       │   ├── batch.js                 # POST /api/batch/run, /progress, /reset
│       │   ├── transactions.js          # GET /api/transactions, POST /:id/recover
│       │   ├── metrics.js               # GET /api/metrics & funnel analytics
│       │   ├── p2p.js                   # GET/POST /api/p2p commitments
│       │   └── voice.js                 # Edge TTS speech synthesis endpoint
│       ├── services/
│       │   ├── classifier.js            # Groq LLM inference with backoff jitter
│       │   ├── guardrails.js            # Hard deterministic safety engine
│       │   ├── razorpayExecutor.js      # Razorpay Orders & Payment Links handler
│       │   └── messageGenerator.js      # Multi-channel recovery copy generator
│       └── data/
│           └── syntheticDataGenerator.js # 54 unique benchmark payment payloads
├── frontend/
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── src/
│       ├── App.jsx                      # App router & theme provider
│       ├── pages/
│       │   ├── Dashboard.jsx            # Single-page executive control center
│       │   └── PaymentPortal.jsx        # Hosted customer recovery checkout page
│       ├── components/
│       │   ├── ExecutiveOverview.jsx    # Real-time hero KPIs & capital tracker
│       │   ├── PipelineWorkflow.jsx     # Visual 5-stage recovery funnel diagram
│       │   ├── AgentFeed.jsx            # Live scrolling autonomous execution log
│       │   ├── GuardrailsModal.jsx      # Policy bound configuration drawer
│       │   ├── AuditDialog.jsx          # 3-stage compliance audit viewer
│       │   ├── PromiseToPayLedger.jsx   # Verbal & digital commitment tracker
│       │   ├── HinglishVoiceStudio.jsx  # Conversational voice AI studio
│       │   ├── MandateRetrySequencer.jsx# RBI salary-cycle retry calendar
│       │   ├── B2BReceivablesChaser.jsx # Net-30/60 invoice aging chaser
│       │   ├── PerformanceChart.jsx     # Recharts recovery breakdown charts
│       │   ├── TopNav.jsx               # Navigation bar & run CTA
│       │   └── Footer.jsx               # Developer spotlight & stack badges
└── docs/
    ├── FlowGuard_Pitch_Guide_Yash_Mishra.pdf # Teleprompter script & submission guide
    └── thumbnail.jpg                    # Official project thumbnail
```

---

## 👨‍💻 Author

**Yash Mishra**  
🏆 **IBM Hackathon Winner** | Lead Architect & Full-Stack Engineer  
- 💼 **LinkedIn**: [linkedin.com/in/ymishra1201](https://linkedin.com/in/ymishra1201)  
- 🐙 **GitHub**: [@notyashXD](https://github.com/notyashXD)  
- 📧 **Email**: [yashmishra1246@gmail.com](mailto:yashmishra1246@gmail.com)  

*Built with passion for the **Razorpay Buildathon 2026**.*
