import { motion } from 'framer-motion';
import { useAnimatedCounter } from '../lib/useAnimatedCounter';
import { formatINR } from '../lib/utils';
import { IndianRupee, TrendingUp, CheckCircle2, AlertTriangle } from 'lucide-react';

function HeroCard({ label, value, formatted, icon: Icon, hasBatch }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="col-span-2 lg:col-span-2 relative overflow-hidden rounded-2xl border border-[rgba(16,185,129,0.2)] bg-[rgba(16,185,129,0.04)] p-6 glow-green"
    >
      {/* Background glow blob */}
      <div className="absolute -right-8 -top-8 w-40 h-40 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />

      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
            <Icon size={16} className="text-emerald-400" />
          </div>
          <span className="text-xs font-semibold text-emerald-500/80 uppercase tracking-widest">{label}</span>
        </div>

        {!hasBatch ? (
          <div className="text-[var(--text-muted)] text-sm mt-2">No batch run yet</div>
        ) : (
          <p className="font-display text-4xl font-bold text-white tracking-tight leading-none">
            {formatted}
          </p>
        )}
      </div>
    </motion.div>
  );
}

function StatCard({ label, value, icon: Icon, color, delay, hasBatch, suffix = '' }) {
  const animated = useAnimatedCounter(value ?? 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="rounded-2xl border border-[var(--border)] bg-[var(--surface-1)] p-5"
    >
      <div className="flex items-center gap-2 mb-3">
        <div className={`p-1.5 rounded-lg bg-white/5 ${color}`}>
          <Icon size={13} />
        </div>
        <span className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">{label}</span>
      </div>

      {!hasBatch ? (
        <div className="text-[var(--text-dim)] text-sm">—</div>
      ) : (
        <p className={`font-display text-2xl font-bold text-white tracking-tight ${color}`}>
          {Math.round(animated).toLocaleString('en-IN')}{suffix}
        </p>
      )}
    </motion.div>
  );
}

export default function MetricsBar({ metrics, hasBatch }) {
  const recoveredCount = useAnimatedCounter(metrics?.totalRecovered ?? 0, 1400);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Hero card — Total Recovered (2x width) */}
      <HeroCard
        label="Total Recovered"
        icon={IndianRupee}
        value={metrics?.totalRecovered}
        formatted={formatINR(Math.round(recoveredCount))}
        hasBatch={hasBatch}
      />

      {/* Three stat cards */}
      <StatCard
        label="Recovery Rate"
        icon={TrendingUp}
        value={metrics?.recoveryRatePercent ?? 0}
        color="text-blue-400"
        delay={0.08}
        hasBatch={hasBatch}
        suffix="%"
      />
      <StatCard
        label="Processed"
        icon={CheckCircle2}
        value={metrics?.totalProcessed ?? 0}
        color="text-slate-300"
        delay={0.14}
        hasBatch={hasBatch}
      />
      <StatCard
        label="Exceptions"
        icon={AlertTriangle}
        value={metrics?.exceptionsCount ?? 0}
        color="text-amber-400"
        delay={0.20}
        hasBatch={hasBatch}
      />
    </div>
  );
}
