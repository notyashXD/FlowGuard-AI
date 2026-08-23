import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Calendar,
  Activity,
  Cpu,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  RefreshCw,
  Shuffle,
  ShieldCheck
} from 'lucide-react';
import { formatINR } from '../lib/utils';

export default function MandateSequencer() {
  const [data, setData] = useState({ bankSwitches: [], scheduledSequences: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSequencerData();
  }, []);

  async function fetchSequencerData() {
    setLoading(true);
    try {
      const res = await fetch('/api/sequencer');
      const json = await res.json();
      if (json && Array.isArray(json.bankSwitches)) {
        setData(json);
      }
    } catch (err) {
      console.error('Failed to load sequencer:', err);
    } finally {
      setLoading(false);
    }
  }

  const bankSwitches = Array.isArray(data?.bankSwitches) ? data.bankSwitches : [];
  const scheduledSequences = Array.isArray(data?.scheduledSequences) ? data.scheduledSequences : [];

  return (
    <div className="luxury-card p-6 bg-surface border-border space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-[#EEF2FF] dark:bg-[#1E4BF0]/15 border border-[#C7D7FE] dark:border-[#1E4BF0]/30 flex items-center justify-center text-[#1E4BF0] dark:text-[#60A5FA]">
            <Shuffle size={14} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-ink">
                Mandate Retry Sequencer & Bank Switch Telemetry
              </h2>
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-surface-tertiary text-ink border border-border font-semibold">
                Auto-Dunning Engine
              </span>
            </div>
            <p className="text-xs text-ink-muted">
              Auto-schedules recurring mandate retries during peak bank uptime and monthly salary credit cycles
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={fetchSequencerData}
          className="self-start sm:self-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border hover:border-border-strong bg-surface hover:bg-surface-secondary text-ink-secondary hover:text-ink text-xs font-medium transition-all cursor-pointer"
        >
          <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
          <span>Refresh Telemetry</span>
        </button>
      </div>

      {/* Bank Switch Health Matrix */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-ink-secondary">
            Live Bank Switch Health & Authorization Matrix
          </span>
          <span className="text-[11px] font-mono text-ink-muted">5 Core Switches Monitored</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {bankSwitches.map((b) => {
            const isDegraded = b.status === 'degraded';
            return (
              <div
                key={b.code}
                className={`p-3.5 rounded-xl border transition-all ${
                  isDegraded
                    ? 'bg-[#FEF8EC] dark:bg-[#F59E0B]/10 border-[#F8E3B6] dark:border-[#F59E0B]/30'
                    : 'bg-surface-secondary border-border-subtle'
                }`}
              >
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-semibold text-ink">{b.bank}</span>
                  <span className={`w-2 h-2 rounded-full ${isDegraded ? 'bg-[#B4710A] dark:bg-[#F59E0B]' : 'bg-[#107C55] dark:bg-[#34D399]'}`} />
                </div>
                <div className="flex items-baseline justify-between mt-2">
                  <span className="text-lg font-bold text-ink tnum">{b.uptime}%</span>
                  <span className="text-[10px] font-mono text-ink-muted">{b.latencyMs}ms</span>
                </div>
                <div className="mt-2 pt-2 border-t border-border-subtle flex justify-between items-center text-[10px]">
                  <span className="text-ink-muted">Auth Rate:</span>
                  <span className="font-semibold text-[#107C55] dark:text-[#34D399]">{b.successRate}</span>
                </div>
                {isDegraded && (
                  <p className="text-[9px] text-[#B4710A] dark:text-[#F59E0B] mt-1.5 font-medium">
                    ⚠️ Auto-rerouting traffic to HDFC switch
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Scheduled Sequences Ledger */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-ink-secondary">
            Upcoming Optimized Mandate Schedules
          </span>
          <span className="text-[11px] font-mono text-[#107C55] dark:text-[#34D399]">94.2% Predicted Authorization Rate</span>
        </div>

        <div className="overflow-x-auto border border-border rounded-xl">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-surface-secondary border-b border-border text-[10px] font-semibold text-ink-muted uppercase tracking-wider">
                <th className="py-3 px-4">Customer & Plan</th>
                <th className="py-3 px-4">Mandate ID</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Target Bank Switch</th>
                <th className="py-3 px-4">Sequencing Strategy</th>
                <th className="py-3 px-4">Optimized Schedule Window</th>
                <th className="py-3 px-4 text-right">Predicted Auth</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle bg-surface">
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 7 }).map((_, j) => (
                      <td key={j} className="py-3 px-4">
                        <div className="shimmer-light h-3.5 rounded" style={{ width: '60%' }} />
                      </td>
                    ))}
                  </tr>
                ))
              ) : scheduledSequences.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-ink-muted">
                    No active mandate sequences queued.
                  </td>
                </tr>
              ) : (
                scheduledSequences.map((s, idx) => (
                  <tr key={idx} className="table-row-hover">
                    <td className="py-3 px-4">
                      <p className="font-semibold text-ink leading-tight">{s.customerName}</p>
                      <p className="text-[10px] text-ink-muted mt-0.5">{s.planName}</p>
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-ink-secondary">
                      {s.mandateId}
                    </td>
                    <td className="py-3 px-4 font-bold text-ink tnum whitespace-nowrap">
                      {formatINR(s.amount)}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-surface-secondary border border-border text-[11px] font-medium text-ink-secondary">
                        <Cpu size={11} className="text-[#1E4BF0] dark:text-[#60A5FA]" />
                        {s.recommendedSwitch}
                      </span>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap text-[11px] text-ink font-medium">
                      {s.strategy}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap font-mono text-[11px] text-ink-secondary">
                      {new Date(s.scheduledDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })} at 03:30 AM IST
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#EBF7F2] dark:bg-[#10B981]/15 text-[#107C55] dark:text-[#34D399] border border-[#BFE7D5] dark:border-[#10B981]/30">
                        {s.predictedSuccessRate}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
