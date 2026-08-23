import { motion } from 'framer-motion';
import { formatINR } from '../lib/utils';
import {
  AlertOctagon,
  Brain,
  ShieldCheck,
  Zap,
  TrendingUp,
  ArrowRight,
  ChevronRight,
  Lock,
  Layers
} from 'lucide-react';

export default function RecoveryFunnel({ funnel, metrics, hasBatch }) {
  if (!hasBatch || !funnel) {
    return (
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-1)] p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-semibold text-white flex items-center gap-2">
              <Layers size={15} className="text-blue-400" />
              Autonomous Recovery Flow & Funnel
            </h2>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              Live progression from initial failure detection to Razorpay API settlement
            </p>
          </div>
          <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-white/5 text-slate-400">
            Awaiting Batch
          </span>
        </div>
        <div className="h-32 flex flex-col items-center justify-center gap-2 border border-dashed border-white/8 rounded-xl text-[var(--text-dim)]">
          <p className="text-xs">Run a batch to generate the interactive recovery flow</p>
        </div>
      </div>
    );
  }

  const s1 = funnel.stage1_detected || {};
  const s2 = funnel.stage2_classified || {};
  const s3 = funnel.stage3_guardrails || {};
  const s4 = funnel.stage4_executed || {};
  const s5 = funnel.stage5_outcome || {};

  const stages = [
    {
      step: '01',
      title: 'Detection',
      icon: AlertOctagon,
      count: `${s1.count || metrics.totalCount || 54} Ingested`,
      sub: formatINR(s1.amount || metrics.totalPotentialAmount || 0),
      color: 'border-orange-500/20 bg-orange-500/5 text-orange-400',
      badge: '4 Categories',
      detail: 'Degradation, Abandonment, Subscription, Receivable'
    },
    {
      step: '02',
      title: 'AI Classification',
      icon: Brain,
      count: `${s2.count || metrics.totalProcessed || 54} Analyzed`,
      sub: 'Groq allam-2-7b',
      color: 'border-violet-500/20 bg-violet-500/5 text-violet-400',
      badge: 'JSON Reasoning',
      detail: `${s2.actions?.send_payment_link || 0} Links · ${s2.actions?.retry_payment || 0} Retries`
    },
    {
      step: '03',
      title: 'Guardrail Bounds',
      icon: ShieldCheck,
      count: `${s3.overridesCount || 0} Overrides`,
      sub: 'Deterministic Rules',
      color: 'border-blue-500/20 bg-blue-500/5 text-blue-400',
      badge: 'Policy Checked',
      detail: `₹50k limits · 3 Retries · 7 Days age`
    },
    {
      step: '04',
      title: 'Razorpay Execution',
      icon: Zap,
      count: `${(s4.ordersCreated || 0) + (s4.linksCreated || 0)} Dispatched`,
      sub: `${s4.manualQueued || 0} Queued Review`,
      color: 'border-amber-500/20 bg-amber-500/5 text-amber-400',
      badge: 'Test Mode APIs',
      detail: `${s4.ordersCreated || 0} Orders · ${s4.linksCreated || 0} Payment Links`
    },
    {
      step: '05',
      title: 'Capital Yield',
      icon: TrendingUp,
      count: formatINR(s5.recoveredAmount || metrics.totalRecovered || 0),
      sub: `${metrics.recoveryRatePercent || 0}% Recovery Rate`,
      color: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20',
      badge: `${s5.recoveredCount || metrics.recoveredCount || 0} Recovered`,
      detail: 'Fully Settled via Razorpay'
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="rounded-2xl border border-[var(--border)] bg-[var(--surface-1)] p-6 space-y-4"
    >
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-white flex items-center gap-2">
            <Layers size={16} className="text-blue-400" />
            Autonomous Recovery Pipeline Flow
          </h2>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            Deterministic state machine from signal detection to payment clearance
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            End-to-End Audited
          </span>
        </div>
      </div>

      {/* Grid of 5 connected stages */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3 pt-2">
        {stages.map((st, idx) => {
          const Icon = st.icon;
          const isLast = idx === stages.length - 1;

          return (
            <motion.div
              key={st.step}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.08 }}
              className={`relative rounded-xl border p-4 flex flex-col justify-between transition-all hover:border-white/20 ${st.color}`}
            >
              {/* Connector arrow on larger screens */}
              {!isLast && (
                <div className="hidden md:flex absolute -right-3.5 top-1/2 -translate-y-1/2 z-20 w-6 h-6 rounded-full bg-[#0b0d16] border border-white/10 items-center justify-center text-slate-400">
                  <ChevronRight size={12} />
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-mono opacity-70">STAGE {st.step}</span>
                  <div className="p-1.5 rounded-lg bg-black/20">
                    <Icon size={14} />
                  </div>
                </div>

                <p className="text-xs font-semibold text-white mb-1">{st.title}</p>
                <p className="font-display text-sm font-bold text-white tracking-tight">{st.count}</p>
                <p className="text-[11px] text-[var(--text-muted)] font-mono mt-0.5">{st.sub}</p>
              </div>

              <div className="mt-3 pt-2.5 border-t border-white/5 text-[10px] text-slate-400 line-clamp-1">
                {st.detail}
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
