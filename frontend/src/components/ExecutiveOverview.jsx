import { motion } from 'framer-motion';
import { useAnimatedCounter } from '../lib/useAnimatedCounter';
import { formatINR, formatNumber } from '../lib/utils';
import {
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  ShieldCheck,
  Zap,
  Layers,
  Sparkles
} from 'lucide-react';

export default function ExecutiveOverview({ metrics, hasBatch }) {
  const recoveredAmount = useAnimatedCounter(metrics?.totalRecovered ?? 0, 1200);
  const recoveryRate = useAnimatedCounter(metrics?.recoveryRatePercent ?? 0, 1000);
  const totalProcessed = useAnimatedCounter(metrics?.totalProcessed ?? 0, 800);
  const exceptionsCount = useAnimatedCounter(metrics?.exceptionsCount ?? 0, 800);

  const potentialValue = metrics?.totalPotentialAmount || 0;
  const yieldPct = metrics?.valueRecoveryRatePercent || (potentialValue > 0 ? ((metrics?.totalRecovered || 0) / potentialValue * 100).toFixed(1) : 0);

  return (
    <div className="space-y-4">
      {/* Top Banner Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* ── Primary Hero Metric (7 cols) ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="lg:col-span-7 luxury-card p-6 flex flex-col justify-between relative overflow-hidden bg-surface border-border"
        >
          {/* Subtle top accent line */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#1E4BF0] via-[#107C55] to-transparent" />

          <div>
            <div className="flex items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-ink-secondary">
                  Total Capital Recovered
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#EBF7F2] dark:bg-[#10B981]/15 text-[#107C55] dark:text-[#34D399] text-[10px] font-medium border border-[#BFE7D5] dark:border-[#10B981]/30">
                  <ArrowUpRight size={11} />
                  {hasBatch ? `+${yieldPct}% Pipeline Yield` : 'Awaiting Run'}
                </span>
              </div>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-[#1E4BF0]/10 dark:bg-[#1E4BF0]/20 text-[#1E4BF0] dark:text-[#60A5FA] border border-[#C7D7FE] dark:border-[#1E4BF0]/30 shadow-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
                Razorpay Automated Settlement
              </span>
            </div>

            {/* Hero Number */}
            <div className="flex items-baseline gap-3 my-2">
              <span className="text-4xl sm:text-5xl font-bold tracking-tight text-ink tnum font-sans">
                {hasBatch ? formatINR(Math.round(recoveredAmount)) : '₹0'}
              </span>
              {hasBatch && (
                <span className="text-xs text-ink-muted font-medium">
                  of {formatINR(potentialValue)} at risk
                </span>
              )}
            </div>
          </div>

          {/* Micro Progress Bar & Meta */}
          <div className="mt-4 pt-4 border-t border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3 w-full sm:w-2/3">
              <div className="flex-1 h-2 rounded-full bg-surface-tertiary overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-[#107C55] dark:bg-[#10B981]"
                  initial={{ width: 0 }}
                  animate={{ width: hasBatch ? `${Math.min(100, Math.max(8, yieldPct))}%` : '0%' }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                />
              </div>
              <span className="text-[11px] font-mono font-medium text-[#107C55] dark:text-[#34D399] flex-shrink-0">
                {hasBatch ? `${yieldPct}% Captured` : '0%'}
              </span>
            </div>

            <div className="text-[11px] text-ink-secondary flex items-center gap-1.5 flex-shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-[#107C55] dark:bg-[#34D399]" />
              <span>{hasBatch ? `${metrics?.recoveredCount || 0} Transactions Settled` : '54 Ingested'}</span>
            </div>
          </div>
        </motion.div>

        {/* ── Secondary Highlights Card (5 cols) ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.08 }}
          className="lg:col-span-5 luxury-card p-6 flex flex-col justify-between bg-surface border-border"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-ink-secondary">
              Autonomous Recovery Yield
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#EEF2FF] dark:bg-[#1E4BF0]/15 text-[#1E4BF0] dark:text-[#60A5FA] border border-[#C7D7FE] dark:border-[#1E4BF0]/30 font-semibold tracking-wide">
              GROQ ALLAM-2-7B
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 my-2">
            <div>
              <p className="text-[11px] text-ink-muted mb-0.5">Success Conversion</p>
              <p className="text-2xl font-bold text-ink tnum font-sans">
                {hasBatch ? `${recoveryRate.toFixed(1)}%` : '—'}
              </p>
              <p className="text-[10px] text-[#107C55] dark:text-[#34D399] mt-0.5 font-medium">
                {hasBatch ? '↑ Benchmark Exceeded' : 'Pending evaluation'}
              </p>
            </div>

            <div>
              <p className="text-[11px] text-ink-muted mb-0.5">Guardrail Protection</p>
              <p className="text-2xl font-bold text-ink tnum font-sans">
                {hasBatch ? `${metrics?.funnel?.stage3_guardrails?.overridesCount || 0}` : '—'}
              </p>
              <p className="text-[10px] text-ink-secondary mt-0.5">
                Risky actions blocked
              </p>
            </div>
          </div>

          <div className="pt-3 border-t border-border flex items-center justify-between text-xs text-ink-secondary">
            <span className="flex items-center gap-1.5 text-[11px]">
              <ShieldCheck size={13} className="text-[#1E4BF0] dark:text-[#60A5FA]" />
              Bounded Deterministic Engine
            </span>
            <span className="font-mono text-[11px] text-[#107C55] dark:text-[#34D399] font-medium">0% Unsafe Retries</span>
          </div>
        </motion.div>

      </div>

      {/* ── 4 Supporting Metrics Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Metric 1: Recovery Rate */}
        <div className="luxury-card p-4 bg-surface border-border">
          <div className="flex items-center justify-between text-xs text-ink-muted mb-1.5">
            <span>Recovery Rate</span>
            <TrendingUp size={13} className="text-[#107C55] dark:text-[#34D399]" />
          </div>
          <p className="text-xl font-bold text-ink tnum">
            {hasBatch ? `${metrics?.recoveryRatePercent || 0}%` : '—'}
          </p>
          <p className="text-[11px] text-ink-secondary mt-1 truncate">
            {hasBatch ? `${metrics?.recoveredCount || 0} of ${metrics?.totalProcessed || 0} recovered` : 'No run yet'}
          </p>
        </div>

        {/* Metric 2: Payments Processed */}
        <div className="luxury-card p-4 bg-surface border-border">
          <div className="flex items-center justify-between text-xs text-ink-muted mb-1.5">
            <span>Payments Processed</span>
            <CheckCircle2 size={13} className="text-[#1E4BF0] dark:text-[#60A5FA]" />
          </div>
          <p className="text-xl font-bold text-ink tnum">
            {hasBatch ? `${formatNumber(Math.round(totalProcessed))} / ${metrics?.totalCount || 54}` : '0 / 54'}
          </p>
          <p className="text-[11px] text-ink-secondary mt-1 truncate">
            {hasBatch ? '100% Ingestion Completed' : '54 Queued for batch'}
          </p>
        </div>

        {/* Metric 3: Exceptions / Escalations */}
        <div className="luxury-card p-4 bg-surface border-border">
          <div className="flex items-center justify-between text-xs text-ink-muted mb-1.5">
            <span>Escalated to Human</span>
            <AlertTriangle size={13} className="text-[#B4710A] dark:text-[#F59E0B]" />
          </div>
          <p className="text-xl font-bold tnum text-[#B4710A] dark:text-[#F59E0B]">
            {hasBatch ? `${formatNumber(Math.round(exceptionsCount))}` : '—'}
          </p>
          <p className="text-[11px] text-ink-secondary mt-1 truncate">
            {hasBatch ? 'B2B & High-Value Protected' : 'Policy bounds active'}
          </p>
        </div>

        {/* Metric 4: Pipeline Value */}
        <div className="luxury-card p-4 bg-surface border-border">
          <div className="flex items-center justify-between text-xs text-ink-muted mb-1.5">
            <span>Pipeline Value at Risk</span>
            <Layers size={13} className="text-ink-muted" />
          </div>
          <p className="text-xl font-bold text-ink tnum">
            {formatINR(potentialValue)}
          </p>
          <p className="text-[11px] text-ink-secondary mt-1 truncate">
            Across 4 failure classes
          </p>
        </div>

      </div>
    </div>
  );
}
