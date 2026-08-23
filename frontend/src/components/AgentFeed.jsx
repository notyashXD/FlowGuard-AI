import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Brain, Scale, Zap, CheckCircle2, Clock } from 'lucide-react';

const STAGE_CONFIG = {
  init:     { icon: Clock,         color: 'text-ink-muted', label: 'Init' },
  classify: { icon: Brain,         color: 'text-[#1E4BF0] dark:text-[#60A5FA]', label: 'Classify' },
  decision: { icon: Scale,         color: 'text-[#B4710A] dark:text-[#F59E0B]', label: 'Policy' },
  execute:  { icon: Zap,           color: 'text-[#107C55] dark:text-[#34D399]', label: 'Execute' },
  done:     { icon: CheckCircle2,  color: 'text-[#107C55] dark:text-[#34D399]', label: 'Success' },
};

function EventRow({ evt, isNew }) {
  const cfg = STAGE_CONFIG[evt.stage] || STAGE_CONFIG.init;
  const Icon = cfg.icon;
  const isDone = evt.stage === 'done';
  const isBound = evt.stage === 'decision' && evt.message.includes('Bound override');

  return (
    <motion.div
      initial={{ opacity: 0, x: -6 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.15 }}
      className={`flex items-start gap-2.5 py-1.5 px-3 rounded-md text-xs font-mono transition-colors ${
        isDone ? 'bg-[#EBF7F2] dark:bg-[#10B981]/15 border border-[#BFE7D5] dark:border-[#10B981]/30 text-[#107C55] dark:text-[#34D399]' :
        isBound ? 'bg-[#FEF8EC] dark:bg-[#F59E0B]/15 border border-[#F8E3B6] dark:border-[#F59E0B]/30 text-[#B4710A] dark:text-[#F59E0B]' :
        isNew ? 'bg-surface border border-border text-ink' : 'text-ink-secondary'
      }`}
    >
      <div className={`mt-0.5 flex-shrink-0 ${cfg.color}`}>
        <Icon size={11} />
      </div>
      <div className="flex-1 min-w-0 flex items-baseline gap-2">
        <span className="text-ink-muted text-[10px] flex-shrink-0">
          [{evt.transactionId?.slice(-8)}]
        </span>
        <span className="text-[11px] truncate font-sans text-ink">
          {evt.message}
        </span>
      </div>
    </motion.div>
  );
}

export default function AgentFeed({ progress, events, isRunning }) {
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [events?.length]);

  const processed = progress?.processed || 0;
  const total = progress?.total || 0;
  const pct = total > 0 ? Math.round((processed / total) * 100) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.25 }}
      className="luxury-card p-5 bg-surface border border-border shadow-elevated space-y-3"
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-border">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#1E4BF0] dark:bg-[#60A5FA] pulse-live" />
          <h3 className="text-xs font-semibold text-ink">
            Live Autonomous Execution Stream
          </h3>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#EEF2FF] dark:bg-[#1E4BF0]/15 text-[#1E4BF0] dark:text-[#60A5FA]">
            GROQ INFERENCE ACTIVE
          </span>
        </div>
        <div className="text-xs font-mono text-ink-secondary">
          {processed}/{total} processed ({pct}%)
        </div>
      </div>

      {/* Progress Line */}
      <div className="h-1.5 bg-surface-tertiary rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-[#1E4BF0] dark:bg-[#3B82F6] rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Feed Container */}
      <div
        ref={scrollRef}
        className="h-44 overflow-y-auto space-y-1 bg-surface-secondary p-2.5 rounded-lg border border-border"
      >
        {events && events.length > 0 ? (
          events.slice(-50).map((evt, i) => (
            <EventRow key={`${evt.transactionId}-${evt.ts}-${i}`} evt={evt} isNew={i >= events.length - 2} />
          ))
        ) : (
          <div className="h-full flex items-center justify-center text-xs text-ink-muted font-mono">
            Initializing autonomous worker threads...
          </div>
        )}
      </div>

      {/* Footer stats */}
      <div className="flex items-center gap-4 text-[11px] font-mono text-ink-secondary pt-1">
        <span className="text-[#107C55] dark:text-[#34D399]">● {progress?.recovered || 0} Auto-Recovered</span>
        <span className="text-[#B4710A] dark:text-[#F59E0B]">● {progress?.escalated || 0} Escalated</span>
        <span className="text-[#C73535] dark:text-[#EF4444]">● {progress?.flagged || 0} Flagged</span>
      </div>
    </motion.div>
  );
}
