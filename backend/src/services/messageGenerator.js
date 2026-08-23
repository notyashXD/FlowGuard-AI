/**
 * Message Generator Service
 * Creates multi-channel recovery communications for failed transactions:
 * 1. WhatsApp interactive template with Razorpay Link
 * 2. Hinglish AI Voice Agent IVR Script (conversational recovery)
 * 3. B2B Net-30 Formal Invoice Reminder / Promise-to-Pay Email
 * 4. Transactional SMS with short URL
 */

function formatINR(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);
}

function generateRecoveryMessages(transaction) {
  const name = transaction.customerName || 'Customer';
  const firstName = name.split(' ')[0];
  const paymentLink = transaction.razorpayPaymentLinkUrl && !transaction.razorpayPaymentLinkUrl.includes('rzp.io/i/rec_')
    ? transaction.razorpayPaymentLinkUrl
    : `${process.env.FRONTEND_URL || 'http://localhost:5173'}/pay/${transaction.transactionId}`;
  const failureType = transaction.failureType;

  // ── 1. WhatsApp Interactive Card ───────────────────────────────────────────
  let whatsappBody = '';
  let itemDescription = metadata.productCategory || metadata.planName || (metadata.itemCount ? `${metadata.itemCount} items` : 'your order');

  if (failureType === 'checkout_abandonment') {
    whatsappBody = `Hi ${firstName}! 👋 We noticed your checkout for *${itemDescription}* (${amountStr}) wasn't completed.

Don't worry — we've reserved your cart items for the next 24 hours. Complete your payment securely via UPI, Card, or Netbanking using the official Razorpay link below:`;
  } else if (failureType === 'subscription_failure') {
    whatsappBody = `Hi ${firstName}! ⚡ Your recurring subscription payment for *${metadata.planName || 'Plan'}* (${amountStr}) couldn't be processed.

To prevent any interruption to your active service, please update your payment method or complete the billing below:`;
  } else if (failureType === 'overdue_receivable') {
    whatsappBody = `Hello ${name} Accounts Team, 📄
This is a gentle reminder regarding Invoice *#${metadata.invoiceId || 'INV-0912'}* for ${amountStr}, which is currently past its ${metadata.creditTerms || 'Net-30'} payment window.

Please process the clearance at your earliest convenience via the Razorpay B2B portal below:`;
  } else {
    whatsappBody = `Hi ${firstName}! ⚠️ Your recent transaction of ${amountStr} for *${itemDescription}* could not be processed due to a temporary bank network issue (${metadata.declineCode || 'NETWORK_TIMEOUT'}).

You can complete this payment securely with zero extra charges using any preferred payment method:`;
  }

  const whatsapp = {
    channel: 'whatsapp',
    sender: 'Razorpay Verified Merchant (Recovery Agent)',
    recipient: transaction.customerContact?.phone || '+91 98765 43210',
    title: '⚡ Payment Recovery Notification',
    body: whatsappBody,
    ctaButton: {
      text: `💳 Pay ${amountStr} Now`,
      url: paymentLink
    },
    footer: '🔒 Secured by Razorpay 256-bit Encryption · Reply STOP to opt out',
    timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
  };

  // ── 2. Hinglish AI Voice Agent (IVR Script) ───────────────────────────────
  let voiceScript = '';
  if (failureType === 'checkout_abandonment') {
    voiceScript = `Namaste ${firstName} ji! Main Razorpay Automated Support Desk se Ananya bol rahi hoon. 
Aapke ${itemDescription} ke liye ${amountStr} ka order checkout page par pending reh gaya tha.
Kya aap is order ko complete karna chahte hain? 
Agar haan, toh main aapke WhatsApp par instant 1-click payment link bhej rahi hoon.
UPI ya Card se pay karne ke liye 1 dabayein, ya hamare customer care executive se baat karne ke liye 2 dabayein. Dhanyawaad!`;
  } else if (failureType === 'subscription_failure') {
    voiceScript = `Namaste ${firstName} ji, yeh call aapke ${metadata.planName || 'Service'} subscription ke regard mein hai. 
Aapke card par bank ki taraf se transaction decline hua hai. 
Service interruption se bachne ke liye humne aapko payment link SMS aur WhatsApp par forward kiya hai.
Payment verify karne ke liye 1 dabayein. Have a great day!`;
  } else if (failureType === 'overdue_receivable') {
    voiceScript = `Hello ${name}, this is an automated receivable desk notification from Razorpay B2B Payments.
Your outstanding invoice balance of ${amountStr} has crossed the credit due date. 
Press 1 to receive the digital payment link with instant GST invoice acknowledgment, or press 2 to schedule a callback with our accounts manager.`;
  } else {
    voiceScript = `Namaste ${firstName} ji, aapka bank se ${amountStr} ka payment technical timeout ki wajah se fail ho gaya tha. 
Paise aapke account se nahi kate hain. 
Aap doobara try karne ke liye WhatsApp pe bheje gaye secure Razorpay link ka use kar sakte hain. Thank you!`;
  }

  const voice = {
    channel: 'voice',
    agentName: 'Razorpay AI Voice Recovery Agent (v2.4)',
    language: 'Hinglish (Natural Indian Voice)',
    estimatedDuration: '32 seconds',
    audioPcmStatus: 'ready_to_synthesize',
    script: voiceScript,
    intent: 'Autonomous Verbal Payment Link Delivery & Promise-to-Pay Confirmation'
  };

  // ── 3. B2B / Customer Email Reminder ──────────────────────────────────────
  const email = {
    channel: 'email',
    subject: failureType === 'overdue_receivable' 
      ? `[Action Required] Outstanding Payment Reminder: Invoice #${metadata.invoiceId || 'INV-2026'} (${amountStr})`
      : `Complete your payment of ${amountStr} for ${itemDescription}`,
    sender: 'billing@merchant-razorpay.com',
    recipient: transaction.customerContact?.email || 'customer@example.com',
    invoiceDetails: {
      invoiceId: metadata.invoiceId || `INV-${transaction.transactionId.slice(-6)}`,
      gstin: metadata.gstNumber || 'GST29ABCDE1234Z',
      terms: metadata.creditTerms || 'Immediate',
      amount: amountStr,
      dueDate: metadata.dueDate ? new Date(metadata.dueDate).toLocaleDateString('en-IN') : 'Immediate'
    },
    bodyHtml: `<p>Dear <strong>${name}</strong>,</p>
<p>We are writing to update you regarding your payment transaction <code>${transaction.transactionId}</code>.</p>
<p><strong>Transaction Summary:</strong><br/>
• Amount: <strong>${amountStr}</strong><br/>
• Category: ${failureType.replace(/_/g, ' ').toUpperCase()}<br/>
• Reason: ${metadata.declineDescription || metadata.failureReason || 'Action required to complete settlement'}</p>
<p>To avoid cancellation, kindly complete the transaction using the secure payment portal link below:</p>
<p><a href="${paymentLink}" style="display:inline-block;padding:10px 20px;background:#2563eb;color:#fff;text-decoration:none;border-radius:6px;font-weight:bold;">Complete Payment via Razorpay</a></p>
<p>Best regards,<br/>Accounts & Collections Automated Desk</p>`
  };

  // ── 4. Transactional SMS ──────────────────────────────────────────────────
  const sms = {
    channel: 'sms',
    sender: 'RZRPAY',
    recipient: transaction.customerContact?.phone || '+91 98765 43210',
    text: `Your payment of ${amountStr} for ${itemDescription.slice(0, 20)} is pending. Click to complete securely via Razorpay: ${paymentLink} - Razorpay`
  };

  return {
    transactionId: transaction.transactionId,
    whatsapp,
    voice,
    email,
    sms
  };
}

module.exports = { generateRecoveryMessages };
