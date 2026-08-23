import os
import sys
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether, HRFlowable
)
from reportlab.pdfgen import canvas

class NumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            super().showPage()
        super().save()

    def draw_page_decorations(self, page_count):
        self.saveState()
        self.setFont("Helvetica-Bold", 8)
        self.setFillColor(colors.HexColor("#64748B"))
        
        # Header (pages > 1)
        if self._pageNumber > 1:
            self.drawString(48, 750, "FlowGuard AI · Razorpay Buildathon 2026 · Line-by-Line Choreographed Pitch Guide")
            self.drawRightString(612 - 48, 750, "Yash Mishra · 🏆 IBM Hackathon Winner")
            self.setStrokeColor(colors.HexColor("#E2E8F0"))
            self.setLineWidth(0.5)
            self.line(48, 742, 612 - 48, 742)
            
        # Footer
        self.setStrokeColor(colors.HexColor("#E2E8F0"))
        self.setLineWidth(0.5)
        self.line(48, 42, 612 - 48, 42)
        
        self.setFont("Helvetica", 8)
        self.drawString(48, 30, "Confidential · Razorpay Buildathon 2026 Submission Dossier · AI Revenue Recovery Track")
        self.drawRightString(612 - 48, 30, f"Page {self._pageNumber} of {page_count}")
        self.restoreState()

def build_pdf():
    pdf_path = "/Volumes/AppleDisk/RazorPay Project/FlowGuard_Pitch_Guide_Yash_Mishra.pdf"
    doc = SimpleDocTemplate(
        pdf_path,
        pagesize=letter,
        leftMargin=44,
        rightMargin=44,
        topMargin=48,
        bottomMargin=48
    )

    styles = getSampleStyleSheet()
    
    # Colors
    c_primary = colors.HexColor("#1E4BF0")
    c_dark = colors.HexColor("#0F172A")
    c_accent = colors.HexColor("#10B981")
    c_slate = colors.HexColor("#475569")
    c_bg_light = colors.HexColor("#F8FAFC")
    c_border = colors.HexColor("#CBD5E1")

    # Styles
    title_style = ParagraphStyle(
        'DocTitle',
        fontName='Helvetica-Bold',
        fontSize=18,
        leading=22,
        textColor=c_dark,
        spaceAfter=3
    )
    
    subtitle_style = ParagraphStyle(
        'DocSubTitle',
        fontName='Helvetica',
        fontSize=9.5,
        leading=13.5,
        textColor=c_slate,
        spaceAfter=10
    )

    h1_style = ParagraphStyle(
        'Heading1_Custom',
        fontName='Helvetica-Bold',
        fontSize=12,
        leading=16,
        textColor=c_primary,
        spaceBefore=10,
        spaceAfter=5,
        keepWithNext=True
    )

    body_style = ParagraphStyle(
        'Body_Custom',
        fontName='Helvetica',
        fontSize=8.5,
        leading=12,
        textColor=c_dark,
        spaceAfter=4
    )

    cue_text_style = ParagraphStyle(
        'CueTextStyle',
        fontName='Helvetica',
        fontSize=9,
        leading=14,
        textColor=colors.HexColor("#0F172A")
    )

    story = []

    # ── HEADER ────────────────────────────────────────────────────────────────
    story.append(Paragraph("FLOWGUARD AI · RAZORPAY BUILDATHON 2026", ParagraphStyle('TopTag', fontName='Helvetica-Bold', fontSize=8, leading=10, textColor=c_primary, spaceAfter=2)))
    story.append(Paragraph("Championship Line-by-Line Video Script & Form Dossier", title_style))
    story.append(Paragraph("<b>Author:</b> Yash Mishra (🏆 IBM Hackathon Winner · Lead Architect) &nbsp;|&nbsp; <b>Track:</b> AI Revenue Recovery", subtitle_style))
    story.append(HRFlowable(width="100%", thickness=1.5, color=c_primary, spaceAfter=10))

    # ── PART 1: FORM ANSWERS ──────────────────────────────────────────────────
    story.append(Paragraph("PART 1: OFFICIAL APPLICATION FORM ANSWERS (COPY-PASTE READY)", h1_style))
    story.append(Paragraph("Copy and paste these verified answers directly into your application form fields:", body_style))
    story.append(Spacer(1, 3))

    formData = [
        [Paragraph("<b>Form Field</b>", body_style), Paragraph("<b>Exact Response to Submit</b>", body_style)],
        [Paragraph("<b>Your Track</b>", body_style), Paragraph("<b>AI Revenue Recovery</b>", body_style)],
        [Paragraph("<b>Project Name</b>", body_style), Paragraph("<b>FlowGuard AI — Autonomous Revenue Defense & Multi-Channel Recovery Engine</b>", body_style)],
        [
            Paragraph("<b>What It Solves</b>", body_style),
            Paragraph(
                "Payment drop-offs and failures cost Indian digital businesses billions annually. Standard payment systems rely on dumb blind retries that anger cardholders, spike chargebacks, and trigger gateway blocks.<br/><br/>"
                "<b>FlowGuard AI closes the entire recovery loop:</b><br/>"
                "• <b>Multi-Channel Ingestion:</b> Detects revenue leaks across 4 streams: Gateway Degradation, Checkout Abandonment, Failed E-Mandates, and Overdue B2B Invoices.<br/>"
                "• <b>AI Root-Cause Diagnosis:</b> Groq LLMs (allam-2-7b) diagnose true failure causes in milliseconds.<br/>"
                "• <b>Deterministic Guardrails:</b> AI recommends, but hard rules decide (₹50k limit, 3-retry cap, 7-day age cutoff) ensuring zero unconstrained execution.<br/>"
                "• <b>Automated Interventions:</b> Dispatches Razorpay Orders & Payment Links, RBI-compliant salary-aligned mandate retries, B2B aging chasers, and conversational Hinglish Voice AI.<br/>"
                "• <b>Immutable Compliance Trail:</b> Every decision is logged across a 3-stage MongoDB audit trail (Classification → Bounds → Execution).",
                body_style
            )
        ],
        [
            Paragraph("<b>What broke, and how you got out</b><br/><font color='#D97706'><i>(Judges read this first!)</i></font>", body_style),
            Paragraph(
                "When scaling our autonomous batch engine to process high-concurrency payment streams, two critical system-level bottlenecks broke:<br/><br/>"
                "<b>1. Razorpay Sandbox Rate Quotas & Error Handling:</b><br/>"
                "Razorpay's test API enforces a strict limit of 30 payment links (RATE_LIMIT_EXCEEDED). When our AI recommended sending payment links for checkout abandonments, the SDK threw a non-standard rejection object without a standard .message property, causing unhandled promise rejections that falsely marked transactions as exceptions.<br/>"
                "<b>→ How we got out:</b> We engineered a resilient gateway adapter in <code>razorpayExecutor.js</code> that parses SDK error structures, traps quota saturation, and seamlessly generates idempotent hosted recovery links with unique short URLs (<code>/pay/:id</code>) without interrupting the batch stream.<br/><br/>"
                "<b>2. Groq TPM Limits vs Real-Time Polling:</b><br/>"
                "Evaluating 54 complex payment payloads concurrently exceeded Groq's 6,000 TPM limit, causing 429 rate-limit storms. Initially, this froze frontend metrics at ₹0 until the entire batch completed.<br/>"
                "<b>→ How we got out:</b> We built an exponential backoff retry handler with dynamic jitter that reads the exact <code>retry-after</code> header from Groq API responses. Simultaneously, we decoupled batch execution from telemetry polling on the frontend—streaming updates concurrently every 700ms across <code>/api/batch/progress</code>, <code>/api/metrics</code>, and <code>/api/transactions</code> so financial metrics, yield charts, and funnel stages count up smoothly in real-time.",
                body_style
            )
        ]
    ]

    tForm = Table(formData, colWidths=[110, 414])
    tForm.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#E2E8F0")),
        ('TEXTCOLOR', (0,0), (-1,0), c_dark),
        ('GRID', (0,0), (-1,-1), 0.5, c_border),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('PADDING', (0,0), (-1,-1), 5),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, c_bg_light])
    ]))
    story.append(tForm)

    # ── PART 2: LINE-BY-LINE CHOREOGRAPHED SCRIPT ──────────────────────────────
    story.append(PageBreak())
    story.append(Paragraph("PART 2: LINE-BY-LINE CHOREOGRAPHED VIDEO SCRIPT", h1_style))
    story.append(Paragraph("Follow every <b>[👉 SCREEN ACTION]</b> cue before/after each spoken line while recording in OBS:", body_style))
    story.append(Spacer(1, 4))

    acts = [
        {
            "header": "ACT 1: THE HOOK & THE FINTECH REALITY (0:00 – 0:45)",
            "lines": [
                (
                    "[👉 POINT MOUSE: Top Navigation Bar — FlowGuard Logo & 'Razorpay Production Stream']",
                    '"Hi everyone, I\'m Yash Mishra, and this is <b>FlowGuard AI</b> — an autonomous revenue defense and payment recovery engine built for the Razorpay Buildathon 2026 under the AI Revenue Recovery track."'
                ),
                (
                    "[👉 HOVER MOUSE: '54 Ingested' badge & the top KPI cards showing ₹0 (Awaiting Run)]",
                    '"In digital payments, revenue loss rarely happens in one clean step. A card times out, a cart gets abandoned at checkout, a recurring mandate declines, or a B2B invoice goes 30 days overdue."'
                ),
                (
                    "[👉 CIRCLE MOUSE: The 4 category cards & Pipeline Workflow chart below]",
                    '"Most legacy payment systems fail in one of two ways: either they blindly hammer customer cards with dumb retries—causing cardholder anger and bank gateway blocks—or they give up entirely."'
                ),
                (
                    "[👉 POINT MOUSE: 'Autonomous Engine Active' pill & 'Guardrails (₹50k · 3r)' pill in top bar]",
                    '"We built FlowGuard around a strict FinTech principle: <b>AI diagnoses and recommends, but deterministic financial guardrails decide and execute.</b> Let\'s see it live."'
                )
            ]
        },
        {
            "header": "ACT 2: LIVE BATCH RUN & REAL-TIME RECOVERY STREAM (0:45 – 2:00)",
            "lines": [
                (
                    "[👉 CLICK: Blue 'Run Batch (54)' button on the top right navigation bar]",
                    '"I\'m starting our live autonomous recovery stream across 54 ingested failed transactions totaling over ₹13.8 Lakhs at risk."'
                ),
                (
                    "[👉 POINT MOUSE: The scrolling Live Execution Stream terminal in the middle of the screen]",
                    '"Watch the live stream: Each transaction is analyzed in real time using Groq LLMs to uncover the true root cause—distinguishing transient bank downtime from expired mandates or CVV mismatches."'
                ),
                (
                    "[👉 POINT MOUSE: Live log rows showing 'Executing action: retry_payment' and 'send_payment_link']",
                    '"Immediately, our engine dispatches bounded interventions through Razorpay\'s APIs. For gateway timeouts, it creates fresh Razorpay Orders. For checkout abandonments, it generates instant personalized Payment Links."'
                ),
                (
                    "[👉 HOVER MOUSE: Over the 'GROQ INFERENCE ACTIVE' badge in the stream header]",
                    '<b>[SAY THIS KEY SCALING LINE]:</b> <i>"When scaling our batch runner across high-concurrency streams, we built an exponential backoff jitter handler and resilient sandbox adapter to navigate Groq TPM limits and Razorpay API rate quotas without interrupting execution."</i>'
                ),
                (
                    "[👉 POINT & CIRCLE: Large 'TOTAL CAPITAL RECOVERED' hero number counting up live]",
                    '"Notice how our hero metric <b>Total Capital Recovered</b> counts up live on screen in real time, capturing over ₹1.49 Lakhs in settled revenue autonomously without human intervention."'
                )
            ]
        },
        {
            "header": "ACT 3: DETERMINISTIC GUARDRAILS & 3-STAGE AUDIT TRAIL (2:00 – 3:00)",
            "lines": [
                (
                    "[👉 CLICK: 'Guardrails (₹50k · 3r)' button in top bar to open the modal drawer]",
                    '"In FinTech, safety and compliance are paramount. An AI agent must never be allowed to execute unconstrained financial actions."'
                ),
                (
                    "[👉 HOVER MOUSE: Over the 3 sliders — Max ₹50,000, 3 Max Retries, 7 Max Age Days]",
                    '"Here is our <b>Deterministic Guardrails Engine</b>. We enforce hard boundaries before any Razorpay API is called:<br/>'
                    '1. Any transaction above ₹50,000 is automatically blocked from auto-retry and routed to human review.<br/>'
                    '2. Retries are capped at 3 attempts to prevent cardholder harassment.<br/>'
                    '3. Stale transactions older than 7 days are protected from unannounced charges."'
                ),
                (
                    "[👉 CLICK: Close modal button (X) → Scroll down to 'Risk & Policy Exceptions' table]",
                    '"Let\'s inspect how compliance is enforced on individual transactions."'
                ),
                (
                    "[👉 CLICK: On any row in the table (e.g. an escalated transaction) to open Full Audit Trail Dialog]",
                    '"When we open the <b>Audit Trail</b> for any transaction, we see an immutable 3-stage compliance record saved in MongoDB: Stage 1 records what the AI recommended, Stage 2 logs the exact policy guardrail applied, and Stage 3 logs the Razorpay API execution response."'
                ),
                (
                    "[👉 POINT MOUSE: 'Customer Payment Link' / 'Open Hosted Checkout' button in dialog, then close dialog]",
                    '"Every generated payment link is uniquely tracked and mapped directly to our live hosted recovery checkout portal."'
                )
            ]
        },
        {
            "header": "ACT 4: HINGLISH VOICE RECOVERY & P2P TRACKER (3:00 – 4:00)",
            "lines": [
                (
                    "[👉 CLICK: 'Hinglish Voice Recovery' tab in the top tab navigation bar]",
                    '"Now let\'s look at our most exciting recovery channel: <b>Conversational Hinglish Voice AI</b>."'
                ),
                (
                    "[👉 HOVER MOUSE: Over the prompt card → [👉 CLICK: 'Synthesize Audio' / Play button for 3 seconds]]",
                    '"In India, over 60% of consumers respond far better to conversational vernacular communication than cold automated emails. FlowGuard includes an Edge TTS voice engine that calls customers, explains why their payment failed in polite conversational Hinglish, and negotiates a Promise-to-Pay commitment."'
                ),
                (
                    "[👉 CLICK: 'Promise-to-Pay Tracker' tab in the top tab navigation bar]",
                    '"Let\'s switch to our <b>Promise-to-Pay Tracker</b>."'
                ),
                (
                    "[👉 POINT MOUSE: The table rows with speech bubbles showing Agent Transcripts and 'Pay Link' button]",
                    '"In our Promise-to-Pay Ledger, every verbal and digital commitment is captured with full conversation transcripts, promised payment dates, and instant verification when the customer settles the payment link."'
                )
            ]
        },
        {
            "header": "ACT 5: MANDATE SEQUENCER & B2B RECEIVABLES CHASER (4:00 – 4:40)",
            "lines": [
                (
                    "[👉 CLICK: 'Mandate Retry Sequencer' tab in the top tab navigation bar]",
                    '"We also solve recurring subscription churn and overdue B2B receivables."'
                ),
                (
                    "[👉 POINT MOUSE: The timeline showing Salary Cycle Window (1st–5th) and cooling periods]",
                    '"Our <b>Mandate Retry Sequencer</b> complies with RBI e-mandate regulations, automatically scheduling smart retries aligned with Indian salary cycles—the 1st to 5th of the month—with exponential cooling periods."'
                ),
                (
                    "[👉 CLICK: 'B2B Receivables Chaser' tab in top navigation → [👉 CLICK: Preview Email Icon on an invoice]]",
                    '"Our <b>B2B Receivables Chaser</b> organizes enterprise invoices into aging buckets—from current to 60+ days overdue—with automated GST-compliant reminder notices and account manager escalation."'
                )
            ]
        },
        {
            "header": "ACT 6: CLOSING PITCH & WHY RAZORPAY (4:40 – 5:00)",
            "lines": [
                (
                    "[👉 CLICK: 'Executive Overview' tab → Scroll smoothly down to the Footer Developer Spotlight Card]",
                    '"FlowGuard AI proves that revenue recovery isn\'t just about retrying cards—it\'s about intelligent diagnosis, multi-channel customer empathy, and rigorous financial safety."'
                ),
                (
                    "[👉 HOVER MOUSE: Over your Profile Photo, '🏆 IBM Hackathon Winner' badge, and LinkedIn / GitHub buttons]",
                    '"I built FlowGuard using Razorpay APIs, Node.js, Express, MongoDB Atlas, Groq AI, and React Vite. As an IBM Hackathon Winner, I am deeply passionate about building high-concurrency payment distributed systems, and I would love the opportunity to bring this engineering mindset to Razorpay as a Software Engineering Intern."'
                ),
                (
                    "[👉 LEAVE SCREEN ON FOOTER PROFILE CARD STEADILY FOR 2 SECONDS]",
                    '"<b>Thank you!</b>"'
                )
            ]
        }
    ]

    for act in acts:
        act_content = []
        act_content.append([Paragraph(f"<b>{act['header']}</b>", ParagraphStyle('ActH', fontName='Helvetica-Bold', fontSize=9.5, leading=13, textColor=c_primary))])
        
        for cue, line in act['lines']:
            row_text = f"<font color='#2563EB'><b>{cue}</b></font><br/>{line}"
            act_content.append([Paragraph(row_text, cue_text_style)])

        tAct = Table(act_content, colWidths=[524])
        tAct.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#EFF6FF")),
            ('BACKGROUND', (0,1), (-1,-1), colors.white),
            ('GRID', (0,0), (-1,-1), 0.5, c_border),
            ('PADDING', (0,0), (-1,-1), 5),
            ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, c_bg_light])
        ]))
        story.append(tAct)
        story.append(Spacer(1, 6))

    # ── PART 3: PRE-FLIGHT CHECKLIST ───────────────────────────────────────────
    story.append(PageBreak())
    story.append(Paragraph("PART 3: 30-SECOND PRE-FLIGHT RECORDING CHECKLIST", h1_style))
    story.append(Paragraph("Check these 4 items right before clicking 'Start Recording' in OBS:", body_style))
    story.append(Spacer(1, 4))

    checklist = [
        [Paragraph("<b>#</b>", body_style), Paragraph("<b>Item</b>", body_style), Paragraph("<b>Status</b>", body_style)],
        [Paragraph("1", body_style), Paragraph("<b>Reset Demo State:</b> Click <b>'Reset Demo'</b> in top right so <b>54 pending transactions</b> are ready.", body_style), Paragraph("READY", ParagraphStyle('G', fontName='Helvetica-Bold', fontSize=8.5, textColor=c_accent))],
        [Paragraph("2", body_style), Paragraph("<b>Mic Input:</b> Confirm Mac input is set to <b>`Yash's iPhone Microphone`</b> with Voice Isolation.", body_style), Paragraph("READY", ParagraphStyle('G', fontName='Helvetica-Bold', fontSize=8.5, textColor=c_accent))],
        [Paragraph("3", body_style), Paragraph("<b>OBS Output:</b> Video will save automatically to <code>/Volumes/AppleDisk/OBS_Recordings/</code> (1080p60 MP4).", body_style), Paragraph("READY", ParagraphStyle('G', fontName='Helvetica-Bold', fontSize=8.5, textColor=c_accent))],
        [Paragraph("4", body_style), Paragraph("<b>Pacing:</b> Target time is <b>4:15 to 4:45 min</b>. Move the mouse cleanly without frantic shaking.", body_style), Paragraph("READY", ParagraphStyle('G', fontName='Helvetica-Bold', fontSize=8.5, textColor=c_accent))]
    ]

    tCheck = Table(checklist, colWidths=[20, 444, 60])
    tCheck.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#E2E8F0")),
        ('GRID', (0,0), (-1,-1), 0.5, c_border),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('PADDING', (0,0), (-1,-1), 5),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, c_bg_light])
    ]))
    story.append(tCheck)

    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"Line-by-Line Choreographed PDF successfully generated at: {pdf_path}")

if __name__ == "__main__":
    build_pdf()
