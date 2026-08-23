import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ShieldCheck,
  CheckCircle2,
  Lock,
  ArrowRight,
  CreditCard,
  QrCode,
  Smartphone,
  Building2,
  AlertCircle,
  ExternalLink,
  ChevronLeft
} from 'lucide-react';
import { formatINR, FAILURE_TYPE_LABELS } from '../lib/utils';

export default function PaymentPortal() {
  const [transaction, setTransaction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState('upi');

  // Extract transactionId from URL path e.g. /pay/TXN-OR-BC198CE1 or query param
  const pathParts = window.location.pathname.split('/');
  const txIdFromPath = pathParts[pathParts.length - 1];

  useEffect(() => {
    async function fetchTransaction() {
      try {
        setLoading(true);
        const res = await fetch(`/api/transactions/${txIdFromPath}`);
        if (res.ok) {
          const data = await res.json();
          const txn = data.transaction || data;
          setTransaction(txn);
          if (txn.status === 'recovered') {
            setPaymentSuccess(true);
          }
        } else {
          // If direct lookup fails, fetch all transactions and match flexibly
          const allRes = await fetch('/api/transactions');
          const data = await allRes.json();
          const list = Array.isArray(data) ? data : (data.transactions || []);
          const clean = txIdFromPath.replace(/^rec_/i, '').toLowerCase();
          const found = list.find(t => 
            t.transactionId.toLowerCase() === txIdFromPath.toLowerCase() ||
            t.transactionId.toLowerCase().includes(clean) ||
            t._id === txIdFromPath ||
            (t.razorpayPaymentLinkId && t.razorpayPaymentLinkId.toLowerCase() === txIdFromPath.toLowerCase())
          );
          if (found) {
            setTransaction(found);
            if (found.status === 'recovered') setPaymentSuccess(true);
          } else {
            setError(`Payment recovery link for ${txIdFromPath} could not be located.`);
          }
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchTransaction();
  }, [txIdFromPath]);

  // Handle Real Razorpay Standard Checkout SDK popup
  const handleRazorpaySDKPayment = () => {
    if (!transaction) return;
    setProcessing(true);

    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_public_key',
      amount: Math.round(transaction.amount * 100),
      currency: transaction.currency || 'INR',
      name: 'Razorpay Merchant Recovery',
      description: `Settlement for ${transaction.transactionId}`,
      image: 'https://razorpay.com/favicon.png',
      handler: async function (response) {
        // Successful payment callback
        try {
          await fetch(`/api/transactions/${transaction.transactionId}/recover`, { method: 'POST' });
          await fetch(`/api/p2p/${transaction.transactionId}/fulfill`, { method: 'POST' }).catch(() => {});
          setPaymentSuccess(true);
        } catch {
          setPaymentSuccess(true);
        }
        setProcessing(false);
      },
      prefill: {
        name: transaction.customerName,
        email: transaction.customerContact?.email || 'customer@example.com',
        contact: transaction.customerContact?.phone || '+919876543210'
      },
      theme: {
        color: '#1E4BF0'
      },
      modal: {
        ondismiss: function () {
          setProcessing(false);
        }
      }
    };

    if (window.Razorpay) {
      const rzp = new window.Razorpay(options);
      rzp.open();
    } else {
      // Load Razorpay script dynamically
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => {
        const rzp = new window.Razorpay(options);
        rzp.open();
      };
      document.body.appendChild(script);
    }
  };

  // Instant 1-Click Simulated Settlement
  const handleSimulatePayment = async () => {
    if (!transaction) return;
    setProcessing(true);
    try {
      await fetch(`/api/transactions/${transaction.transactionId}/recover`, { method: 'POST' });
      await fetch(`/api/p2p/${transaction.transactionId}/fulfill`, { method: 'POST' }).catch(() => {});
      setTimeout(() => {
        setPaymentSuccess(true);
        setProcessing(false);
      }, 800);
    } catch {
      setPaymentSuccess(true);
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-canvas text-ink flex items-center justify-center font-sans">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-[#1E4BF0] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-ink-muted font-mono">Loading Razorpay Secure Checkout...</p>
        </div>
      </div>
    );
  }

  if (error || !transaction) {
    return (
      <div className="min-h-screen bg-canvas text-ink flex items-center justify-center p-4 font-sans">
        <div className="luxury-card max-w-md w-full p-6 text-center space-y-4 bg-surface border-border">
          <AlertCircle size={32} className="text-[#C73535] mx-auto" />
          <h2 className="text-base font-bold text-ink">Payment Link Expired or Invalid</h2>
          <p className="text-xs text-ink-muted">
            The requested payment link is invalid or has already been settled.
          </p>
          <a
            href="/"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-surface-secondary border border-border text-xs text-ink hover:bg-surface-tertiary"
          >
            <ChevronLeft size={14} />
            <span>Return to Dashboard</span>
          </a>
        </div>
      </div>
    );
  }

  const amountStr = formatINR(transaction.amount);
  const metadata = transaction.metadata || {};
  const itemDescription = metadata.productCategory || metadata.planName || (metadata.itemCount ? `${metadata.itemCount} items` : 'Order Clearance');

  return (
    <div className="min-h-screen bg-canvas text-ink flex flex-col justify-between font-sans selection:bg-[#1E4BF0] selection:text-white">
      {/* Top Banner */}
      <header className="border-b border-border bg-surface px-6 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#1E4BF0] flex items-center justify-center text-white font-bold text-sm">
            R
          </div>
          <div>
            <h1 className="text-xs font-bold text-ink">Razorpay Payment Gateway</h1>
            <p className="text-[10px] text-ink-muted flex items-center gap-1">
              <ShieldCheck size={11} className="text-[#107C55] dark:text-[#34D399]" />
              Official 256-bit SSL Encrypted Checkout
            </p>
          </div>
        </div>

        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-surface-tertiary text-ink-secondary">
          TEST MODE
        </span>
      </header>

      {/* Main Payment Container */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="max-w-lg w-full">
          
          {paymentSuccess ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="luxury-card p-8 bg-surface border border-[#BFE7D5] dark:border-[#10B981]/40 rounded-2xl text-center space-y-5 shadow-elevated"
            >
              <div className="w-16 h-16 rounded-full bg-[#EBF7F2] dark:bg-[#10B981]/20 border border-[#BFE7D5] dark:border-[#10B981]/40 flex items-center justify-center text-[#107C55] dark:text-[#34D399] mx-auto">
                <CheckCircle2 size={36} />
              </div>

              <div className="space-y-1">
                <h2 className="text-xl font-bold text-ink">Payment Successful!</h2>
                <p className="text-xs text-ink-muted">
                  Transaction #{transaction.transactionId} has been successfully settled.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-surface-secondary border border-border text-xs space-y-2 font-mono text-left">
                <div className="flex justify-between">
                  <span className="text-ink-muted">Amount Paid:</span>
                  <span className="font-bold text-[#107C55] dark:text-[#34D399]">{amountStr}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ink-muted">Customer:</span>
                  <span className="text-ink">{transaction.customerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ink-muted">Payment Method:</span>
                  <span className="text-ink">UPI / Razorpay Test Mode</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ink-muted">Settlement Status:</span>
                  <span className="text-[#107C55] dark:text-[#34D399] font-bold">Cleared & Recovered</span>
                </div>
              </div>

              <a
                href="/"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-ink text-canvas text-xs font-semibold hover:opacity-90 transition-opacity"
              >
                <span>Return to Autonomous Recovery Dashboard</span>
                <ArrowRight size={13} />
              </a>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="luxury-card bg-surface border-border rounded-2xl shadow-elevated overflow-hidden"
            >
              {/* Order Summary Header */}
              <div className="p-6 bg-surface-secondary border-b border-border space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-ink-muted font-mono">{transaction.transactionId}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-surface-tertiary font-mono text-ink-secondary">
                    {FAILURE_TYPE_LABELS[transaction.failureType] || 'Pending Payment'}
                  </span>
                </div>

                <div className="flex items-baseline justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-ink">{transaction.customerName}</h2>
                    <p className="text-xs text-ink-muted mt-0.5">{itemDescription}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-bold text-ink tnum">{amountStr}</span>
                    <p className="text-[10px] text-ink-muted">INR (Incl. GST)</p>
                  </div>
                </div>
              </div>

              {/* Payment Methods */}
              <div className="p-6 space-y-5">
                <p className="text-xs font-semibold uppercase tracking-wider text-ink-secondary">
                  Select Preferred Payment Mode
                </p>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  {[
                    { id: 'upi', label: 'UPI / QR Code', desc: 'GPay, PhonePe, Paytm', icon: QrCode },
                    { id: 'card', label: 'Credit / Debit Card', desc: 'Visa, Mastercard, RuPay', icon: CreditCard },
                    { id: 'netbanking', label: 'Netbanking', desc: 'HDFC, ICICI, SBI, Axis', icon: Building2 },
                    { id: 'wallet', label: 'Pay Later / Wallets', desc: 'Simpl, Amazon Pay', icon: Smartphone }
                  ].map(m => {
                    const Icon = m.icon;
                    const isSelected = selectedMethod === m.id;
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setSelectedMethod(m.id)}
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#EEF2FF] dark:bg-[#1E4BF0]/15 border-[#1E4BF0] text-ink shadow-xs'
                            : 'bg-surface border-border hover:border-border-strong text-ink-secondary'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <Icon size={14} className={isSelected ? 'text-[#1E4BF0] dark:text-[#60A5FA]' : 'text-ink-muted'} />
                          <span className="font-semibold text-xs text-ink">{m.label}</span>
                        </div>
                        <p className="text-[10px] text-ink-muted">{m.desc}</p>
                      </button>
                    );
                  })}
                </div>

                {/* Actions */}
                <div className="space-y-2.5 pt-2">
                  <button
                    type="button"
                    onClick={handleRazorpaySDKPayment}
                    disabled={processing}
                    className="w-full py-3 rounded-xl bg-[#1E4BF0] dark:bg-[#2563EB] hover:bg-[#163BD4] text-white font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer disabled:opacity-50"
                  >
                    <Lock size={13} />
                    <span>{processing ? 'Connecting to Razorpay...' : `Pay ${amountStr} via Official Razorpay Modal`}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleSimulatePayment}
                    disabled={processing}
                    className="w-full py-2.5 rounded-xl bg-surface-secondary hover:bg-surface-tertiary text-ink border border-border text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <CheckCircle2 size={13} className="text-[#107C55] dark:text-[#34D399]" />
                    <span>Instant 1-Click Test Settlement (Zero Latency)</span>
                  </button>
                </div>

                <div className="flex items-center justify-center gap-2 text-[10px] text-ink-muted pt-2 border-t border-border">
                  <Lock size={10} />
                  <span>Secured by Razorpay Payments Pvt Ltd · 256-bit Encryption</span>
                </div>
              </div>
            </motion.div>
          )}

        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-surface px-6 py-3 text-center text-xs text-ink-muted">
        Razorpay Autonomous Payment Recovery System · Production Test Environment
      </footer>
    </div>
  );
}
