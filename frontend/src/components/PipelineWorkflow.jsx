import { motion } from 'framer-motion';
import { formatINR } from '../lib/utils';
import {
  AlertCircle,
  Brain,
  ShieldCheck,
  Zap,
  TrendingUp,
  ChevronRight,
  CheckCircle2
} from 'lucide-react';

export default function PipelineWorkflow({ funnel, metrics, hasBatch, batchRunning }) {
  const s1 = funnel?.stage1_detected || {};
  const s2 = funnel?.stage2_classified || {};
  const s3 = funnel?.stage3_guardrails || {};
  const s4 = funnel?.stage4_executed || {};
  const s5 = funnel?.stage5_outcome || {};

  const stages = [
    {
      id: '01',
      title: 'Detection',
      icon: AlertCircle,
      status: hasBatch ? 'Completed' : 'Standby',
      metric: `${s1.count || metrics?.totalCount || 54} Ingested`,
      secondary: formatINR(s1.amount || metrics?.totalPotentialAmount || 0),
      desc: 'Failed payment telemetry streamed from gateway',
      active: batchRunning
    },
    {
      id: '02',
      title: 'AI Classification',
      icon: Brain,
      status: hasBatch ? 'Analyzed' : 'Standby',
      metric: `${s2.count || metrics?.totalProcessed || (hasBatch ? 54 : 0)} Evaluated`,
      secondary: 'Groq allam-2-7b',
      desc: 'Root cause extraction & action recommendation',
      active: batchRunning
    },
    {
      id: '03',
      title: 'Guardrail Bounds',
      icon: ShieldCheck,
      status: hasBatch ? 'Enforced' : 'Standby',
      metric: `${s3.overridesCount || 0} Overrides`,
      secondary: 'Deterministic Rules',
      desc: 'High-value & retry limit policy enforcement',
      active: batchRunning
    },
    {
      id: '04',
      title: 'Razorpay Execution',
      icon: Zap,
      status: hasBatch ? 'Dispatched' : 'Standby',
      metric: `${(s4.ordersCreated || 0) + (s4.linksCreated || 0)} Settled`,
      secondary: `${s4.manualQueued || 0} Queued Review`,
      desc: 'Orders API & Payment Links dispatch',
      active: batchRunning
    },
    {
      id: '05',
      title: 'Capital Yield',
      icon: TrendingUp,
      status: hasBatch ? 'Settled' : 'Standby',
      metric: formatINR(s5.recoveredAmount || metrics?.totalRecovered || 0),
      secondary: `${metrics?.recoveryRatePercent || 0}% Recovery Rate`,
      desc: 'Net revenue recovered into merchant account',
      active: false
    }
  ];

  return (
    <div className="luxury-card p-6 bg-surface border-border">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-surface-tertiary border border-border flex items-center justify-center text-ink">
            <Zap size={14} className="text-[#1E4BF0] dark:text-[#60A5FA]" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-ink">
              Autonomous Recovery Pipeline
            </h2>
            <p className="text-xs text-ink-muted">
              Deterministic workflow state machine from signal detection to payment clearance
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {batchRunning ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#EEF2FF] dark:bg-[#1E4BF0]/15 border border-[#C7D7FE] dark:border-[#1E4BF0]/30 text-[#1E4BF0] dark:text-[#60A5FA] text-[11px] font-medium font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-[#1E4BF0] dark:bg-[#60A5FA] animate-ping" />
              Stream In Flight
            </span>
          ) : hasBatch ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#EBF7F2] dark:bg-[#10B981]/15 border border-[#BFE7D5] dark:border-[#10B981]/30 text-[#107C55] dark:text-[#34D399] text-[11px] font-medium font-mono">
              <CheckCircle2 size={12} />
              Pipeline Verified
            </span>
          ) : (
            <span className="text-[11px] text-ink-muted font-mono">
              54 Transactions Loaded
            </span>
          )}
        </div>
      </div>

      {/* Connected Nodes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3 relative">
        {stages.map((st, index) => {
          const Icon = st.icon;
          const isLast = index === stages.length - 1;

          return (
            <div key={st.id} className="relative flex flex-col">
              {/* Node Card */}
              <div
                className={`flex-1 p-4 rounded-xl border transition-all ${
                  isLast && hasBatch
                    ? 'bg-surface-secondary border-[#BFE7D5] dark:border-[#10B981]/40 ring-1 ring-[#107C55]/20 dark:ring-[#10B981]/20'
                    : 'bg-surface-secondary border-border hover:border-border-strong'
                }`}
              >
                {/* Node Top Header */}
                <div className="flex items-center justify-between gap-2 mb-2.5">
                  <span className="text-[10px] font-mono font-semibold text-ink-muted">
                    STAGE {st.id}
                  </span>
                  <div className="flex items-center gap-1.5">
                    {hasBatch ? (
                      <span className="w-1.5 h-1.5 rounded-full bg-[#107C55] dark:bg-[#34D399]" />
                    ) : (
                      <span className="w-1.5 h-1.5 rounded-full bg-border-strong" />
                    )}
                    <span className="text-[10px] font-medium text-ink-secondary">
                      {st.status}
                    </span>
                  </div>
                </div>

                {/* Node Title & Icon */}
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-1 rounded-md bg-surface border border-border text-ink">
                    <Icon size={13} className={isLast && hasBatch ? 'text-[#107C55] dark:text-[#34D399]' : 'text-[#1E4BF0] dark:text-[#60A5FA]'} />
                  </div>
                  <h3 className="text-xs font-semibold text-ink">
                    {st.title}
                  </h3>
                </div>

                {/* Main Metric */}
                <div className="my-1.5">
                  <p className="text-sm font-bold text-ink tnum font-sans tracking-tight">
                    {st.metric}
                  </p>
                  <p className="text-[11px] font-mono text-ink-muted mt-0.5">
                    {st.secondary}
                  </p>
                </div>

                {/* Description */}
                <p className="text-[11px] text-ink-secondary leading-relaxed mt-2 pt-2 border-t border-border-subtle">
                  {st.desc}
                </p>
              </div>

              {/* Connector Arrow for MD+ */}
              {!isLast && (
                <div className="hidden md:flex absolute -right-3 top-1/2 -translate-y-1/2 z-10 w-5 h-5 rounded-full bg-surface border border-border items-center justify-center text-ink-muted shadow-xs">
                  <ChevronRight size={11} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
