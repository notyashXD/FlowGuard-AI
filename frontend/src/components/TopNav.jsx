import { motion, AnimatePresence } from 'framer-motion';
import {
  Zap,
  Play,
  RotateCcw,
  RefreshCw,
  ShieldCheck,
  CheckCircle2,
  ChevronRight,
  Sun,
  Moon
} from 'lucide-react';
import { useTheme } from '../lib/useTheme';

import FlowGuardLogo from './FlowGuardLogo';

export default function TopNav({
  batchRunning,
  pendingCount,
  metricsLoading,
  resetting,
  guardrails,
  onRunBatch,
  onOpenGuardrails,
  onResetPipeline,
  onRefresh
}) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <header className="bg-surface border-b border-border sticky top-0 z-30 shadow-[0_1px_3px_0_rgba(0,0,0,0.02)] transition-colors">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Left: Brand + Breadcrumbs + Status */}
        <div className="flex items-center gap-4 min-w-0">
          <div className="flex items-center gap-3">
            <FlowGuardLogo size={34} />
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-base font-bold text-ink tracking-tight leading-none font-sans">
                  FlowGuard
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wider bg-[#1E4BF0]/10 dark:bg-[#1E4BF0]/20 text-[#1E4BF0] dark:text-[#60A5FA] border border-[#C7D7FE] dark:border-[#1E4BF0]/30">
                  AI OS
                </span>
              </div>
              <span className="text-[11px] text-ink-muted mt-0.5 font-medium leading-none">
                Autonomous Revenue Defense for Razorpay
              </span>
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-1.5 text-xs text-ink-muted pl-3 border-l border-border">
            <span>Payments Ops</span>
            <ChevronRight size={12} className="text-ink-muted/50" />
            <span className="text-ink font-medium">Razorpay Production Stream</span>
          </div>

          {/* Autonomous Status Pill */}
          <div className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#EBF7F2] dark:bg-[#10B981]/10 border border-[#BFE7D5] dark:border-[#10B981]/30 text-[#107C55] dark:text-[#34D399] text-[11px] font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-[#107C55] dark:bg-[#34D399] pulse-live" />
            <span>Autonomous Engine Active</span>
          </div>
        </div>

        {/* Right: Controls + Theme Switch + Action Toolbar */}
        <div className="flex items-center gap-2 sm:gap-2.5 flex-shrink-0">
          
          {/* Environment Tag */}
          <div className="hidden md:flex items-center gap-1 px-2.5 py-1 rounded-md bg-surface-tertiary border border-border text-ink-secondary text-[11px] font-mono font-medium">
            <span>TEST MODE</span>
          </div>

          {/* Guardrails config button */}
          <button
            type="button"
            onClick={onOpenGuardrails}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border hover:border-border-strong bg-surface hover:bg-surface-secondary text-ink text-xs font-medium transition-all shadow-[0_1px_2px_rgba(0,0,0,0.02)] cursor-pointer"
            title="Configure Active Safety Guardrails"
          >
            <ShieldCheck size={13} className="text-[#1E4BF0] dark:text-[#60A5FA]" />
            <span>Guardrails</span>
            {guardrails && (
              <span className="hidden xl:inline-block text-[10px] text-ink-muted font-mono font-normal">
                (₹{((guardrails.highValueThreshold || 50000) / 1000).toFixed(0)}k · {guardrails.maxRetryAttempts || 3}r)
              </span>
            )}
          </button>

          {/* Reset Demo button */}
          <button
            type="button"
            onClick={onResetPipeline}
            disabled={batchRunning || resetting}
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-border hover:border-border-strong bg-surface hover:bg-surface-secondary text-ink-secondary hover:text-ink text-xs font-medium transition-all cursor-pointer disabled:opacity-40"
            title="Reset transactions to pending state to evaluate new guardrail bounds"
          >
            <RotateCcw size={12} className={resetting ? 'animate-spin' : ''} />
            <span>Reset Demo</span>
          </button>

          {/* Refresh button */}
          <button
            type="button"
            onClick={onRefresh}
            disabled={batchRunning}
            className="p-1.5 rounded-lg border border-border hover:border-border-strong bg-surface hover:bg-surface-secondary text-ink-secondary hover:text-ink transition-all cursor-pointer disabled:opacity-40"
            title="Refresh pipeline data"
          >
            <RefreshCw size={13} className={metricsLoading ? 'animate-spin' : ''} />
          </button>

          {/* ── Dark / Light Mode Switch Toggle ── */}
          <button
            type="button"
            onClick={toggleTheme}
            className="p-1.5 rounded-lg border border-border hover:border-border-strong bg-surface hover:bg-surface-secondary text-ink-secondary hover:text-ink transition-all cursor-pointer shadow-[0_1px_2px_rgba(0,0,0,0.02)]"
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle theme"
          >
            <AnimatePresence mode="wait" initial={false}>
              {isDark ? (
                <motion.div
                  key="sun"
                  initial={{ rotate: -90, opacity: 0, scale: 0.8 }}
                  animate={{ rotate: 0, opacity: 1, scale: 1 }}
                  exit={{ rotate: 90, opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.15 }}
                >
                  <Sun size={14} className="text-[#FBBF24]" />
                </motion.div>
              ) : (
                <motion.div
                  key="moon"
                  initial={{ rotate: 90, opacity: 0, scale: 0.8 }}
                  animate={{ rotate: 0, opacity: 1, scale: 1 }}
                  exit={{ rotate: -90, opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.15 }}
                >
                  <Moon size={14} className="text-[#475569]" />
                </motion.div>
              )}
            </AnimatePresence>
          </button>

          {/* Primary CTA: Run Autonomous Batch */}
          <motion.button
            type="button"
            onClick={onRunBatch}
            disabled={batchRunning || pendingCount === 0}
            whileHover={{ scale: batchRunning || pendingCount === 0 ? 1 : 1.01 }}
            whileTap={{ scale: 0.98 }}
            className={`
              flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all shadow-sm
              ${batchRunning || pendingCount === 0
                ? 'bg-surface-muted text-ink-muted border border-border cursor-not-allowed'
                : 'bg-[#1E4BF0] dark:bg-[#2563EB] hover:bg-[#163BD4] text-white border border-[#163BD4] cursor-pointer shadow-[0_1px_3px_rgba(30,75,240,0.25)]'}
            `}
          >
            {batchRunning ? (
              <>
                <span className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                <span>Processing Stream…</span>
              </>
            ) : (
              <>
                <Play size={12} fill="currentColor" />
                <span>Run Batch</span>
                {pendingCount > 0 && (
                  <span className="px-1.5 py-0.2 rounded bg-white/20 text-[10px] font-mono font-semibold">
                    {pendingCount}
                  </span>
                )}
              </>
            )}
          </motion.button>
        </div>

      </div>
    </header>
  );
}
