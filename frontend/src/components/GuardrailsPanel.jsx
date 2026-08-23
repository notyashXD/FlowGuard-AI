import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck,
  RotateCcw,
  Check,
  X,
  Lock,
  Sliders,
  Sparkles,
  Zap,
  CheckCircle2,
  HelpCircle
} from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';
import { formatINR } from '../lib/utils';

export default function GuardrailsPanel({ open, onClose, onSave }) {
  const [guardrails, setGuardrails] = useState({
    maxRetryAttempts: 3,
    maxAgeDays: 7,
    highValueThreshold: 50000,
    lowConfidenceFallback: true,
    autoPaymentLinkForAbandonment: true
  });
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (open) {
      fetchGuardrails();
    }
  }, [open]);

  async function fetchGuardrails() {
    try {
      const res = await fetch('/api/batch/guardrails');
      const data = await res.json();
      if (data.guardrails) setGuardrails(data.guardrails);
    } catch (err) {
      console.error('Failed to load guardrails:', err);
    }
  }

  async function handleSave() {
    setLoading(true);
    try {
      const res = await fetch('/api/batch/guardrails', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(guardrails)
      });
      const data = await res.json();
      if (data.guardrails) setGuardrails(data.guardrails);
      setSaved(true);
      if (onSave) onSave(data.guardrails);
      setTimeout(() => {
        setSaved(false);
        onClose();
      }, 500);
    } catch (err) {
      console.error('Failed to save guardrails:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleResetDefaults() {
    try {
      const res = await fetch('/api/batch/guardrails/reset', { method: 'POST' });
      const data = await res.json();
      if (data.guardrails) setGuardrails(data.guardrails);
    } catch (err) {
      console.error('Failed to reset defaults:', err);
    }
  }

  // Calculate slider fill percentages
  const thresholdPct = Math.round(((guardrails.highValueThreshold - 10000) / (100000 - 10000)) * 100);
  const retryPct = Math.round(((guardrails.maxRetryAttempts - 1) / (5 - 1)) * 100);
  const agePct = Math.round(((guardrails.maxAgeDays - 1) / (30 - 1)) * 100);

  return (
    <Dialog.Root open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <Dialog.Portal>
        <Dialog.Overlay asChild>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 transition-opacity"
          />
        </Dialog.Overlay>

        <Dialog.Content asChild>
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 20 }}
            transition={{ type: 'spring', damping: 26, stiffness: 350 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={onClose}
          >
            <div
              className="relative w-full max-w-xl rounded-2xl border border-border bg-surface shadow-2xl p-6 sm:p-7 text-ink overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              {/* Top Ambient Glow */}
              <div className="absolute -top-24 -left-24 w-48 h-48 bg-[#1E4BF0]/20 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-[#10B981]/15 rounded-full blur-3xl pointer-events-none" />

              {/* Header */}
              <div className="flex items-start justify-between pb-5 border-b border-border relative z-10">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-[#EEF2FF] dark:bg-[#1E4BF0]/20 border border-[#C7D7FE] dark:border-[#1E4BF0]/40 flex items-center justify-center text-[#1E4BF0] dark:text-[#60A5FA] shadow-xs">
                    <ShieldCheck size={20} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-base font-bold text-ink">
                        Deterministic Guardrails Policy
                      </h2>
                      <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-[#EEF2FF] dark:bg-[#1E4BF0]/20 text-[#1E4BF0] dark:text-[#60A5FA] border border-[#C7D7FE] dark:border-[#1E4BF0]/40">
                        Live Enforced
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 dark:text-slate-300 mt-0.5 font-normal">
                      Bounded runtime safety parameters enforced before any autonomous payment execution
                    </p>
                  </div>
                </div>

                <Dialog.Close asChild>
                  <button className="p-1.5 rounded-lg text-slate-400 hover:text-ink hover:bg-surface-secondary border border-transparent hover:border-border transition-all cursor-pointer">
                    <X size={18} />
                  </button>
                </Dialog.Close>
              </div>

              {/* Controls Form */}
              <div className="py-6 space-y-4 relative z-10">
                
                {/* 1. High-Value Threshold Slider */}
                <div className="p-4 sm:p-5 rounded-xl bg-surface-secondary border border-border space-y-3.5 transition-all hover:border-border-strong">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-xs sm:text-sm font-bold text-ink flex items-center gap-1.5">
                        High-Value Escalation Threshold
                      </label>
                      <p className="text-xs text-slate-400 dark:text-slate-300 mt-0.5">
                        Transactions exceeding this capital limit require human supervisor sign-off
                      </p>
                    </div>

                    <motion.span
                      key={guardrails.highValueThreshold}
                      initial={{ scale: 0.9, opacity: 0.8 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="font-bold text-sm text-[#1E4BF0] dark:text-[#60A5FA] bg-[#EEF2FF] dark:bg-[#1E4BF0]/20 border border-[#C7D7FE] dark:border-[#1E4BF0]/40 px-3 py-1 rounded-lg font-mono shadow-[0_0_12px_rgba(30,75,240,0.15)]"
                    >
                      {formatINR(guardrails.highValueThreshold)}
                    </motion.span>
                  </div>

                  <div className="pt-1 space-y-2">
                    <input
                      type="range"
                      min="10000"
                      max="100000"
                      step="5000"
                      value={guardrails.highValueThreshold}
                      onChange={e => setGuardrails({ ...guardrails, highValueThreshold: Number(e.target.value) })}
                      style={{
                        background: `linear-gradient(to right, #1E4BF0 0%, #3B82F6 ${thresholdPct}%, var(--bg-surface-tertiary) ${thresholdPct}%, var(--bg-surface-tertiary) 100%)`
                      }}
                      className="w-full h-2 rounded-lg appearance-none cursor-pointer accent-[#1E4BF0] dark:accent-[#3B82F6]"
                    />

                    <div className="flex justify-between text-[11px] text-slate-400 dark:text-slate-300 font-mono font-medium px-0.5">
                      <span>₹10,000</span>
                      <span className="text-[#1E4BF0] dark:text-[#60A5FA] font-semibold">₹50,000 (Default Target)</span>
                      <span>₹1,00,000</span>
                    </div>
                  </div>
                </div>

                {/* 2. Max Retries & Max Age Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  
                  {/* Max Retries */}
                  <div className="p-4 rounded-xl bg-surface-secondary border border-border space-y-3 transition-all hover:border-border-strong">
                    <div className="flex justify-between items-center">
                      <div>
                        <label className="text-xs sm:text-sm font-bold text-ink">Max Retry Limit</label>
                        <p className="text-[11px] text-slate-400 dark:text-slate-300 mt-0.5">
                          Stop automated retries if attempts &ge; limit
                        </p>
                      </div>
                      <motion.span
                        key={guardrails.maxRetryAttempts}
                        initial={{ scale: 0.9 }}
                        animate={{ scale: 1 }}
                        className="font-bold text-xs text-[#1E4BF0] dark:text-[#60A5FA] bg-[#EEF2FF] dark:bg-[#1E4BF0]/20 border border-[#C7D7FE] dark:border-[#1E4BF0]/40 px-2.5 py-0.5 rounded-md font-mono"
                      >
                        {guardrails.maxRetryAttempts} Attempts
                      </motion.span>
                    </div>

                    <input
                      type="range"
                      min="1"
                      max="5"
                      step="1"
                      value={guardrails.maxRetryAttempts}
                      onChange={e => setGuardrails({ ...guardrails, maxRetryAttempts: Number(e.target.value) })}
                      style={{
                        background: `linear-gradient(to right, #1E4BF0 0%, #3B82F6 ${retryPct}%, var(--bg-surface-tertiary) ${retryPct}%, var(--bg-surface-tertiary) 100%)`
                      }}
                      className="w-full h-2 rounded-lg appearance-none cursor-pointer accent-[#1E4BF0] dark:accent-[#3B82F6]"
                    />

                    <div className="flex justify-between text-[10px] text-slate-400 dark:text-slate-300 font-mono font-medium">
                      <span>1 (Conservative)</span>
                      <span>3 (Default)</span>
                      <span>5 (Aggressive)</span>
                    </div>
                  </div>

                  {/* Stale Age Limit */}
                  <div className="p-4 rounded-xl bg-surface-secondary border border-border space-y-3 transition-all hover:border-border-strong">
                    <div className="flex justify-between items-center">
                      <div>
                        <label className="text-xs sm:text-sm font-bold text-ink">Max Transaction Age</label>
                        <p className="text-[11px] text-slate-400 dark:text-slate-300 mt-0.5">
                          Block auto-action on stale failures
                        </p>
                      </div>
                      <motion.span
                        key={guardrails.maxAgeDays}
                        initial={{ scale: 0.9 }}
                        animate={{ scale: 1 }}
                        className="font-bold text-xs text-[#1E4BF0] dark:text-[#60A5FA] bg-[#EEF2FF] dark:bg-[#1E4BF0]/20 border border-[#C7D7FE] dark:border-[#1E4BF0]/40 px-2.5 py-0.5 rounded-md font-mono"
                      >
                        {guardrails.maxAgeDays} Days
                      </motion.span>
                    </div>

                    <input
                      type="range"
                      min="1"
                      max="30"
                      step="1"
                      value={guardrails.maxAgeDays}
                      onChange={e => setGuardrails({ ...guardrails, maxAgeDays: Number(e.target.value) })}
                      style={{
                        background: `linear-gradient(to right, #1E4BF0 0%, #3B82F6 ${agePct}%, var(--bg-surface-tertiary) ${agePct}%, var(--bg-surface-tertiary) 100%)`
                      }}
                      className="w-full h-2 rounded-lg appearance-none cursor-pointer accent-[#1E4BF0] dark:accent-[#3B82F6]"
                    />

                    <div className="flex justify-between text-[10px] text-slate-400 dark:text-slate-300 font-mono font-medium">
                      <span>1 Day</span>
                      <span>7 Days (Default)</span>
                      <span>30 Days</span>
                    </div>
                  </div>

                </div>

                {/* 3. Toggles */}
                <div className="p-4 sm:p-5 rounded-xl bg-surface-secondary border border-border space-y-3.5">
                  
                  {/* Low Confidence Toggle */}
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs sm:text-sm font-bold text-ink">
                        Low-Confidence Fallback Route
                      </p>
                      <p className="text-xs text-slate-400 dark:text-slate-300 mt-0.5">
                        Automatically divert uncertain root-cause classifications to manual human audit
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setGuardrails({ ...guardrails, lowConfidenceFallback: !guardrails.lowConfidenceFallback })}
                      className={`relative w-11 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer flex-shrink-0 ${
                        guardrails.lowConfidenceFallback
                          ? 'bg-[#1E4BF0] dark:bg-[#2563EB] shadow-[0_0_10px_rgba(30,75,240,0.35)]'
                          : 'bg-surface-tertiary border border-border'
                      }`}
                    >
                      <motion.div
                        layout
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                        className="w-4 h-4 rounded-full bg-white shadow-sm flex items-center justify-center"
                        style={{ marginLeft: guardrails.lowConfidenceFallback ? 'auto' : '0' }}
                      />
                    </button>
                  </div>

                  {/* Cart Abandonment Toggle */}
                  <div className="flex items-center justify-between gap-3 border-t border-border-subtle pt-3.5">
                    <div>
                      <p className="text-xs sm:text-sm font-bold text-ink">
                        Instant Cart Abandonment Link Generator
                      </p>
                      <p className="text-xs text-slate-400 dark:text-slate-300 mt-0.5">
                        Immediately push dynamic 1-click Razorpay payment links for drops & timeouts
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setGuardrails({ ...guardrails, autoPaymentLinkForAbandonment: !guardrails.autoPaymentLinkForAbandonment })}
                      className={`relative w-11 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer flex-shrink-0 ${
                        guardrails.autoPaymentLinkForAbandonment
                          ? 'bg-[#1E4BF0] dark:bg-[#2563EB] shadow-[0_0_10px_rgba(30,75,240,0.35)]'
                          : 'bg-surface-tertiary border border-border'
                      }`}
                    >
                      <motion.div
                        layout
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                        className="w-4 h-4 rounded-full bg-white shadow-sm flex items-center justify-center"
                        style={{ marginLeft: guardrails.autoPaymentLinkForAbandonment ? 'auto' : '0' }}
                      />
                    </button>
                  </div>

                </div>

              </div>

              {/* Footer Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-border relative z-10">
                <button
                  type="button"
                  onClick={handleResetDefaults}
                  className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-300 hover:text-ink font-medium transition-colors cursor-pointer"
                >
                  <RotateCcw size={13} />
                  <span>Restore Factory Bounds</span>
                </button>

                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-3.5 py-2 rounded-xl border border-border text-xs font-semibold text-ink-secondary hover:text-ink hover:bg-surface-secondary transition-all cursor-pointer"
                  >
                    Cancel
                  </button>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={handleSave}
                    disabled={loading}
                    className="flex items-center gap-2 px-5 py-2 rounded-xl bg-[#1E4BF0] dark:bg-[#2563EB] hover:bg-[#163BD4] text-white font-bold text-xs shadow-md transition-all cursor-pointer disabled:opacity-50"
                  >
                    {saved ? (
                      <>
                        <Check size={14} className="text-emerald-300" />
                        <span>Policy Saved!</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck size={14} />
                        <span>Apply Active Policy Bounds</span>
                      </>
                    )}
                  </motion.button>
                </div>
              </div>

            </div>
          </motion.div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
