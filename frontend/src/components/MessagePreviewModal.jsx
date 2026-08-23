import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as Dialog from '@radix-ui/react-dialog';
import {
  MessageSquare,
  PhoneCall,
  Mail,
  Smartphone,
  Play,
  Pause,
  ExternalLink,
  Shield,
  CheckCircle2,
  Copy,
  X,
  Volume2
} from 'lucide-react';
import { formatINR, FAILURE_TYPE_LABELS } from '../lib/utils';

export default function MessagePreviewModal({ transaction, open, onClose }) {
  const [activeTab, setActiveTab] = useState('whatsapp');
  const [isPlayingVoice, setIsPlayingVoice] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!transaction) return null;

  const name = transaction.customerName || 'Customer';
  const firstName = name.split(' ')[0];
  const amountStr = formatINR(transaction.amount);
  const paymentLink = (transaction.razorpayPaymentLinkUrl && !transaction.razorpayPaymentLinkUrl.includes('rzp.io/i/rec_'))
    ? transaction.razorpayPaymentLinkUrl
    : `${window.location.origin}/pay/${transaction.transactionId}`;
  const metadata = transaction.metadata || {};
  const failureType = transaction.failureType;

  let itemDescription = metadata.productCategory || metadata.planName || (metadata.itemCount ? `${metadata.itemCount} items` : 'your order');

  const handleCopyLink = () => {
    navigator.clipboard.writeText(paymentLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  // Natural Indian Female Voice playback using audio stream with fallback
  const handlePlayVoice = () => {
    if (isPlayingVoice) {
      if (window._currentVoiceAudio) {
        window._currentVoiceAudio.pause();
        window._currentVoiceAudio = null;
      }
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
      setIsPlayingVoice(false);
      return;
    }

    try {
      if (window._currentVoiceAudio) {
        window._currentVoiceAudio.pause();
        window._currentVoiceAudio = null;
      }
      const audioUrl = `/api/voice/synthesize?text=${encodeURIComponent(voiceScript)}&lang=hi`;
      const audio = new Audio(audioUrl);
      window._currentVoiceAudio = audio;

      audio.onplay = () => setIsPlayingVoice(true);
      audio.onended = () => {
        setIsPlayingVoice(false);
        window._currentVoiceAudio = null;
      };
      audio.onerror = () => {
        playWebSpeechFallback();
      };

      audio.play().catch(() => {
        playWebSpeechFallback();
      });
    } catch {
      playWebSpeechFallback();
    }
  };

  const playWebSpeechFallback = () => {
    if ('speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(voiceScript);
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        const voices = window.speechSynthesis.getVoices();
        const femaleIndianVoice = voices.find(v =>
          (v.name.includes('Veena') || v.name.includes('Lekha') || v.name.includes('Kalyani') || v.name.includes('Neerja')) ||
          (v.lang.includes('hi') && v.name.toLowerCase().includes('female')) ||
          (v.lang.includes('IN') && (v.name.toLowerCase().includes('female') || v.name.includes('Google')))
        ) || voices.find(v => v.lang.includes('IN') || v.lang.includes('hi'));

        if (femaleIndianVoice) utterance.voice = femaleIndianVoice;
        utterance.onstart = () => setIsPlayingVoice(true);
        utterance.onend = () => setIsPlayingVoice(false);
        utterance.onerror = () => setIsPlayingVoice(false);
        window.speechSynthesis.speak(utterance);
      } catch {
        setIsPlayingVoice(false);
      }
    }
  };

  // 1. WhatsApp Template
  let whatsappBody = '';
  if (failureType === 'checkout_abandonment') {
    whatsappBody = `Hi ${firstName}! 👋 We noticed your checkout for *${itemDescription}* (${amountStr}) wasn't completed.\n\nDon't worry — we've reserved your cart items for the next 24 hours. Complete your payment securely via UPI, Card, or Netbanking using the official Razorpay link below:`;
  } else if (failureType === 'subscription_failure') {
    whatsappBody = `Hi ${firstName}! ⚡ Your recurring subscription payment for *${metadata.planName || 'Plan'}* (${amountStr}) couldn't be processed.\n\nTo prevent any interruption to your active service, please update your payment method or complete the billing below:`;
  } else if (failureType === 'overdue_receivable') {
    whatsappBody = `Hello ${name} Accounts Team, 📄\nThis is a gentle reminder regarding Invoice *#${metadata.invoiceId || 'INV-0912'}* for ${amountStr}, which is currently past its ${metadata.creditTerms || 'Net-30'} payment window.\n\nPlease process the clearance at your earliest convenience via the Razorpay B2B portal below:`;
  } else {
    whatsappBody = `Hi ${firstName}! ⚠️ Your recent transaction of ${amountStr} for *${itemDescription}* could not be processed due to a temporary bank network issue (${metadata.declineCode || 'NETWORK_TIMEOUT'}).\n\nYou can complete this payment securely with zero extra charges using any preferred payment method:`;
  }

  // 2. Hinglish Voice Script
  let voiceScript = '';
  if (failureType === 'checkout_abandonment') {
    voiceScript = `Namaste ${firstName} ji! Main Razorpay Automated Support Desk se Ananya bol rahi hoon. Aapke ${itemDescription} ke liye ${amountStr} ka order checkout page par pending reh gaya tha. Kya aap is order ko complete karna chahte hain? Main aapke WhatsApp par instant 1-click payment link bhej rahi hoon. UPI se pay karne ke liye 1 dabayein, ya customer care executive se baat karne ke liye 2 dabayein. Dhanyawaad!`;
  } else if (failureType === 'subscription_failure') {
    voiceScript = `Namaste ${firstName} ji, yeh call aapke ${metadata.planName || 'Service'} subscription ke regard mein hai. Aapke card par bank decline hua hai. Service interruption se bachne ke liye humne aapko payment link SMS aur WhatsApp par forward kiya hai. Instant payment verify karne ke liye 1 dabayein. Have a great day!`;
  } else if (failureType === 'overdue_receivable') {
    voiceScript = `Hello ${name}, this is an automated receivable desk notification from Razorpay B2B Payments. Your outstanding invoice balance of ${amountStr} has crossed the credit due date. Press 1 to receive the digital payment link with instant GST invoice acknowledgment, or press 2 to schedule a callback with our accounts manager.`;
  } else {
    voiceScript = `Namaste ${firstName} ji, main Razorpay support se Ananya bol rahi hoon. Aapke bank se ${amountStr} ka payment technical timeout ki wajah se fail ho gaya tha. Paise aapke account se nahi kate hain. Aap doobara try karne ke liye WhatsApp pe bheje gaye secure Razorpay link ka use kar sakte hain. Thank you!`;
  }

  return (
    <Dialog.Root open={open} onOpenChange={(o) => { if (!o) { if ('speechSynthesis' in window) window.speechSynthesis.cancel(); onClose(); } }}>
      <Dialog.Portal>
        <Dialog.Overlay asChild>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50"
          />
        </Dialog.Overlay>

        <Dialog.Content asChild>
          <motion.div
            initial={{ opacity: 0, scale: 0.98, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 16 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={onClose}
          >
            <div
              className="relative w-full max-w-2xl max-h-[88vh] overflow-y-auto rounded-xl border border-border bg-surface text-ink shadow-dropdown p-6"
              onClick={e => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-start justify-between pb-4 border-b border-border">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-ink-secondary bg-surface-tertiary px-2 py-0.5 rounded">
                      {transaction.transactionId}
                    </span>
                    <span className="text-xs text-ink-muted">
                      {FAILURE_TYPE_LABELS[failureType]} · {amountStr}
                    </span>
                  </div>
                  <h2 className="text-base font-bold text-ink mt-1">
                    Multi-Channel Recovery Communications Preview
                  </h2>
                  <p className="text-xs text-ink-muted mt-0.5">
                    Customer recovery dispatch template generated for {transaction.customerName}
                  </p>
                </div>
                <Dialog.Close asChild>
                  <button className="p-1 rounded-lg text-ink-muted hover:text-ink hover:bg-surface-secondary transition-colors cursor-pointer">
                    <X size={16} />
                  </button>
                </Dialog.Close>
              </div>

              {/* Channel Tabs */}
              <div className="flex items-center gap-2 pt-4 pb-3 border-b border-border-subtle overflow-x-auto">
                {[
                  { id: 'whatsapp', label: 'WhatsApp Card', icon: MessageSquare, color: 'text-[#107C55] dark:text-[#34D399]' },
                  { id: 'voice', label: 'Hinglish AI Voice Agent', icon: PhoneCall, color: 'text-[#1E4BF0] dark:text-[#60A5FA]' },
                  { id: 'email', label: 'B2B / Email Reminder', icon: Mail, color: 'text-ink-secondary' },
                  { id: 'sms', label: 'Transactional SMS', icon: Smartphone, color: 'text-[#B4710A] dark:text-[#F59E0B]' }
                ].map(tab => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => {
                        setActiveTab(tab.id);
                        if ('speechSynthesis' in window) window.speechSynthesis.cancel();
                        setIsPlayingVoice(false);
                      }}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                        isActive
                          ? 'bg-ink text-canvas shadow-xs font-semibold'
                          : 'text-ink-secondary hover:text-ink hover:bg-surface-secondary'
                      }`}
                    >
                      <Icon size={13} className={isActive ? 'text-canvas' : tab.color} />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Tab Contents */}
              <div className="py-4">
                
                {/* 1. WhatsApp Tab */}
                {activeTab === 'whatsapp' && (
                  <div className="max-w-md mx-auto bg-surface-secondary border border-border rounded-2xl p-4 shadow-sm text-xs space-y-3 font-sans">
                    {/* Header */}
                    <div className="flex items-center gap-2.5 pb-2.5 border-b border-border">
                      <div className="w-8 h-8 rounded-full bg-[#107C55] flex items-center justify-center text-white font-bold text-xs">
                        R
                      </div>
                      <div>
                        <p className="font-semibold text-ink flex items-center gap-1">
                          Razorpay Recovery Desk
                          <CheckCircle2 size={12} className="text-[#107C55] dark:text-[#34D399]" />
                        </p>
                        <p className="text-[10px] text-ink-muted">Verified Business Account</p>
                      </div>
                    </div>

                    {/* Chat Bubble */}
                    <div className="bg-surface border border-border text-ink p-3.5 rounded-xl rounded-tl-none space-y-3 leading-relaxed shadow-xs">
                      <p className="whitespace-pre-line text-xs">{whatsappBody}</p>

                      <a
                        href={paymentLink}
                        target="_blank"
                        rel="noreferrer"
                        className="block w-full py-2.5 px-4 bg-[#107C55] hover:bg-[#0B6142] text-white font-semibold text-center rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-sm text-xs"
                      >
                        <span>💳 Pay {amountStr} Securely</span>
                        <ExternalLink size={12} />
                      </a>

                      <p className="text-[10px] text-ink-muted text-center flex items-center justify-center gap-1">
                        <Shield size={10} className="text-[#107C55] dark:text-[#34D399]" />
                        Razorpay 256-bit Encrypted Checkout
                      </p>
                    </div>

                    <div className="flex justify-between items-center text-[10px] text-ink-muted px-1">
                      <span>Delivered to {transaction.customerContact?.phone || '+91 98765 43210'}</span>
                      <span className="text-[#107C55] dark:text-[#34D399]">✓✓ Read</span>
                    </div>
                  </div>
                )}

                {/* 2. Voice Agent Tab */}
                {activeTab === 'voice' && (
                  <div className="bg-surface-secondary border border-border rounded-xl p-5 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-[#EEF2FF] dark:bg-[#1E4BF0]/15 border border-[#C7D7FE] dark:border-[#1E4BF0]/30 flex items-center justify-center text-[#1E4BF0] dark:text-[#60A5FA]">
                          <PhoneCall size={16} />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-ink flex items-center gap-2">
                            Autonomous Voice Recovery Agent
                            <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-[#EEF2FF] dark:bg-[#1E4BF0]/15 text-[#1E4BF0] dark:text-[#60A5FA] font-mono">
                              Hinglish IVR
                            </span>
                          </p>
                          <p className="text-[11px] text-ink-muted mt-0.5">
                            Conversational verbal recovery for high-intent checkout drops
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={handlePlayVoice}
                        className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg font-medium text-xs transition-all cursor-pointer ${
                          isPlayingVoice
                            ? 'bg-[#C73535] text-white shadow-xs'
                            : 'bg-[#1E4BF0] dark:bg-[#2563EB] hover:bg-[#163BD4] text-white shadow-xs'
                        }`}
                      >
                        {isPlayingVoice ? (
                          <>
                            <Pause size={13} />
                            <span>Stop Audio</span>
                          </>
                        ) : (
                          <>
                            <Play size={13} fill="currentColor" />
                            <span>Listen Audio</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Waveform Visualization */}
                    {isPlayingVoice && (
                      <div className="flex items-center justify-center gap-1 py-3 bg-[#EEF2FF] dark:bg-[#1E4BF0]/15 rounded-lg border border-[#C7D7FE] dark:border-[#1E4BF0]/30">
                        {[40, 70, 30, 90, 50, 100, 60, 80, 45, 95, 35, 75, 55, 85, 40].map((h, i) => (
                          <motion.div
                            key={i}
                            className="w-1 bg-[#1E4BF0] dark:bg-[#60A5FA] rounded-full"
                            animate={{ height: [8, h * 0.3, 8] }}
                            transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.05 }}
                          />
                        ))}
                        <span className="text-[11px] text-[#1E4BF0] dark:text-[#60A5FA] ml-3 font-mono font-medium">
                          Synthesizing natural Indian speech...
                        </span>
                      </div>
                    )}

                    {/* Spoken Transcript */}
                    <div className="bg-surface rounded-lg p-4 border border-border space-y-2">
                      <p className="text-[10px] uppercase tracking-wider font-mono text-ink-muted">
                        Spoken Dialogue Transcript:
                      </p>
                      <p className="text-xs text-ink leading-relaxed italic">
                        "{voiceScript}"
                      </p>
                    </div>

                    {/* Interactive Keypad Routes */}
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="p-3 rounded-lg bg-surface border border-border">
                        <span className="font-bold text-[#1E4BF0] dark:text-[#60A5FA] font-mono">Press 1:</span>
                        <p className="text-ink-secondary text-[11px] mt-0.5">Instant WhatsApp Payment Link Dispatch</p>
                      </div>
                      <div className="p-3 rounded-lg bg-surface border border-border">
                        <span className="font-bold text-[#1E4BF0] dark:text-[#60A5FA] font-mono">Press 2:</span>
                        <p className="text-ink-secondary text-[11px] mt-0.5">Transfer to Human Collections Representative</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. Email Tab */}
                {activeTab === 'email' && (
                  <div className="bg-surface-secondary border border-border rounded-xl p-5 shadow-xs text-xs space-y-3">
                    <div className="space-y-1 pb-3 border-b border-border text-ink-secondary text-[11px]">
                      <p><span className="text-ink-muted">From:</span> Razorpay Merchant Billing &lt;billing@merchant.com&gt;</p>
                      <p><span className="text-ink-muted">To:</span> {transaction.customerContact?.email || 'customer@example.com'}</p>
                      <p><span className="text-ink-muted">Subject:</span> <strong className="text-ink">Payment Settlement Notice for Transaction #{transaction.transactionId} ({amountStr})</strong></p>
                    </div>

                    <div className="space-y-3 pt-2 text-ink leading-relaxed bg-surface p-4 rounded-lg border border-border">
                      <p>Dear <strong>{name}</strong>,</p>
                      <p>
                        We noticed your recent payment attempt for <strong>{itemDescription}</strong> ({amountStr}) was not finalized.
                      </p>
                      <div className="p-3 bg-surface-secondary rounded-md border border-border-subtle space-y-1 text-xs font-mono">
                        <p>Invoice ID: {metadata.invoiceId || 'INV-2026-091'}</p>
                        <p>Total Amount: {amountStr} (INR)</p>
                        <p>Payment Status: Pending Clearance</p>
                      </div>
                      <p className="text-xs">To settle this balance, please click the secure link below:</p>
                      <a
                        href={paymentLink}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-block py-2 px-4 bg-[#1E4BF0] dark:bg-[#2563EB] hover:bg-[#163BD4] text-white font-semibold rounded-md transition-colors text-xs"
                      >
                        Complete Payment via Razorpay →
                      </a>
                    </div>
                  </div>
                )}

                {/* 4. SMS Tab */}
                {activeTab === 'sms' && (
                  <div className="max-w-md mx-auto bg-surface-secondary border border-border rounded-xl p-4 text-xs space-y-3">
                    <div className="flex items-center justify-between text-ink-muted text-[10px] pb-2 border-b border-border">
                      <span>Sender: <strong className="text-ink font-mono">RZRPAY</strong></span>
                      <span>To: {transaction.customerContact?.phone || '+91 98765 43210'}</span>
                    </div>

                    <div className="p-3 bg-surface border border-border text-ink rounded-lg leading-relaxed shadow-xs">
                      Your payment of {amountStr} for {itemDescription.slice(0, 25)} is pending. Complete now via Razorpay: <span className="text-[#1E4BF0] dark:text-[#60A5FA] underline font-mono">{paymentLink}</span>
                    </div>
                  </div>
                )}

              </div>

              {/* Link copy footer */}
              <div className="flex items-center justify-between pt-3 border-t border-border text-xs">
                <div className="flex items-center gap-2 text-ink-muted font-mono text-[11px] truncate max-w-sm">
                  <span>Razorpay Link:</span>
                  <span className="text-[#1E4BF0] dark:text-[#60A5FA] truncate">{paymentLink}</span>
                </div>
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-surface-secondary hover:bg-surface-tertiary text-ink text-xs border border-border transition-colors cursor-pointer"
                >
                  <Copy size={11} />
                  <span>{copied ? 'Copied!' : 'Copy Link'}</span>
                </button>
              </div>

            </div>
          </motion.div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
