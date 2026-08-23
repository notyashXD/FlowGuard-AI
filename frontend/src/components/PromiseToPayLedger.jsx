import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CalendarCheck,
  CheckCircle2,
  AlertTriangle,
  Clock,
  MessageSquare,
  PhoneCall,
  Mail,
  Plus,
  ArrowRight,
  ShieldAlert,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { formatINR, formatNumber, timeAgo } from '../lib/utils';

export default function PromiseToPayLedger({ onRefreshMetrics }) {
  const [data, setData] = useState({ summary: {}, promises: [] });
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    fetchPromises();
  }, []);

  async function fetchPromises() {
    setLoading(true);
    try {
      const res = await fetch('/api/p2p');
      const json = await res.json();
      if (json && Array.isArray(json.promises)) {
        setData(json);
      }
    } catch (err) {
      console.error('Failed to load P2P ledger:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleFulfill(promiseId) {
    setActionLoading(promiseId);
    try {
      await fetch(`/api/p2p/${promiseId}/fulfill`, { method: 'POST' });
      await fetchPromises();
      if (onRefreshMetrics) onRefreshMetrics();
    } catch (err) {
      console.error('Fulfill error:', err);
    } finally {
      setActionLoading(null);
    }
  }

  async function handleEscalate(promiseId) {
    setActionLoading(promiseId);
    try {
      await fetch(`/api/p2p/${promiseId}/escalate`, { method: 'POST' });
      await fetchPromises();
      if (onRefreshMetrics) onRefreshMetrics();
    } catch (err) {
      console.error('Escalate error:', err);
    } finally {
      setActionLoading(null);
    }
  }

  const summary = data?.summary || {};
  const promises = Array.isArray(data?.promises) ? data.promises : [];

  const channelIcons = {
    voice_agent: PhoneCall,
    whatsapp: MessageSquare,
    email: Mail,
    sms: MessageSquare,
    manual_agent: Clock
  };

  return (
    <div className="luxury-card p-6 bg-surface border-border space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-[#EBF7F2] dark:bg-[#10B981]/15 border border-[#BFE7D5] dark:border-[#10B981]/30 flex items-center justify-center text-[#107C55] dark:text-[#34D399]">
            <CalendarCheck size={14} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-ink">
                Promise-to-Pay (P2P) Commitment Tracker
              </h2>
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-surface-tertiary text-ink border border-border font-semibold">
                Active Ledger
              </span>
            </div>
            <p className="text-xs text-ink-muted">
              Track verbal and digital customer payment commitments captured by autonomous agents
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-ink-secondary">
            {summary?.activeCount || 0} Active Commitments
          </span>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl bg-surface-secondary border border-border-subtle">
          <p className="text-[11px] text-ink-muted">Total Promised Capital</p>
          <p className="text-lg font-bold text-ink tnum mt-0.5">
            {formatINR(summary?.totalPromised || 0)}
          </p>
          <p className="text-[10px] text-ink-secondary mt-0.5">Under active commitment</p>
        </div>

        <div className="p-3.5 rounded-xl bg-surface-secondary border border-border-subtle">
          <p className="text-[11px] text-ink-muted">Fulfillment Rate</p>
          <p className="text-lg font-bold text-[#107C55] dark:text-[#34D399] tnum mt-0.5">
            {summary?.fulfillmentRate || 0}%
          </p>
          <p className="text-[10px] text-[#107C55] dark:text-[#34D399] mt-0.5">Promises kept by customers</p>
        </div>

        <div className="p-3.5 rounded-xl bg-surface-secondary border border-border-subtle">
          <p className="text-[11px] text-ink-muted">Settled via Commitment</p>
          <p className="text-lg font-bold text-ink tnum mt-0.5">
            {formatINR(summary?.totalSettled || 0)}
          </p>
          <p className="text-[10px] text-ink-secondary mt-0.5">{summary?.fulfilledCount || 0} commitments fulfilled</p>
        </div>

        <div className="p-3.5 rounded-xl bg-surface-secondary border border-border-subtle">
          <p className="text-[11px] text-ink-muted">Broken Promises</p>
          <p className="text-lg font-bold text-[#B4710A] dark:text-[#F59E0B] tnum mt-0.5">
            {summary?.brokenCount || 0}
          </p>
          <p className="text-[10px] text-ink-secondary mt-0.5">Auto-escalated to human desk</p>
        </div>
      </div>

      {/* Commitments Table */}
      <div className="overflow-x-auto border border-border rounded-xl shadow-xs">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-surface-secondary border-b border-border text-[10px] font-semibold text-ink-muted uppercase tracking-wider">
              <th className="py-3 px-4">Customer & Commitment ID</th>
              <th className="py-3 px-4">Amount</th>
              <th className="py-3 px-4">Capture Channel</th>
              <th className="py-3 px-4">Promised Date</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 min-w-[320px]">Agent Notes & Transcript Log</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle bg-surface">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <tr key={i}>
                  {Array.from({ length: 7 }).map((_, j) => (
                    <td key={j} className="py-3 px-4">
                      <div className="skeleton-shimmer h-4 rounded-md" style={{ width: j === 5 ? '90%' : '60%' }} />
                    </td>
                  ))}
                </tr>
              ))
            ) : promises.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-ink-muted">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <CalendarCheck size={28} className="text-ink-muted/40" />
                    <p className="font-medium text-xs">No promise to pay commitments recorded yet.</p>
                  </div>
                </td>
              </tr>
            ) : (
              promises.map((p, idx) => {
                const ChannelIcon = channelIcons[p.channel] || PhoneCall;
                const isFulfilled = p.status === 'fulfilled';
                const isBroken = p.status === 'broken';
                const isActive = p.status === 'active';

                return (
                  <motion.tr
                    key={p.promiseId}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: idx * 0.04 }}
                    className="table-row-hover group"
                  >
                    <td className="py-3.5 px-4 align-top">
                      <p className="font-semibold text-ink leading-tight text-xs">{p.customerName}</p>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className="text-[10px] font-mono font-medium px-1.5 py-0.2 rounded bg-surface-tertiary border border-border text-ink-secondary">
                          {p.promiseId}
                        </span>
                        <span className="text-[10px] font-mono text-ink-muted">{p.transactionId}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 align-top font-bold text-ink tnum whitespace-nowrap text-xs">
                      {formatINR(p.amount)}
                    </td>

                    <td className="py-3.5 px-4 align-top whitespace-nowrap">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium bg-surface-secondary border border-border text-ink-secondary shadow-xs">
                        <ChannelIcon size={12} className="text-[#1E4BF0] dark:text-[#60A5FA]" />
                        <span className="capitalize">{p.channel.replace(/_/g, ' ')}</span>
                      </span>
                    </td>

                    <td className="py-3.5 px-4 align-top whitespace-nowrap font-mono text-[11px] text-ink font-medium">
                      {new Date(p.promisedDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>

                    <td className="py-3.5 px-4 align-top whitespace-nowrap">
                      {isFulfilled ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-medium bg-[#EBF7F2] dark:bg-[#10B981]/15 text-[#107C55] dark:text-[#34D399] border border-[#BFE7D5] dark:border-[#10B981]/30">
                          <CheckCircle2 size={11} /> Fulfilled / Paid
                        </span>
                      ) : isBroken ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-medium bg-[#FEF8EC] dark:bg-[#F59E0B]/15 text-[#B4710A] dark:text-[#F59E0B] border border-[#F8E3B6] dark:border-[#F59E0B]/30">
                          <AlertTriangle size={11} /> Broken Promise
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-medium bg-[#EEF2FF] dark:bg-[#1E4BF0]/15 text-[#1E4BF0] dark:text-[#60A5FA] border border-[#C7D7FE] dark:border-[#1E4BF0]/30">
                          <Clock size={11} /> Active Commitment
                        </span>
                      )}
                    </td>

                    {/* Fully Visible Formatted Agent Notes */}
                    <td className="py-3.5 px-4 align-top min-w-[320px]">
                      {p.notes ? (
                        <div className="p-2.5 rounded-lg bg-surface-secondary/90 border border-border-subtle hover:border-border transition-colors">
                          <div className="flex items-start gap-2">
                            <MessageSquare size={13} className="text-[#1E4BF0] dark:text-[#60A5FA] flex-shrink-0 mt-0.5" />
                            <p className="text-xs text-ink leading-relaxed whitespace-pre-wrap break-words font-sans">
                              {p.notes}
                            </p>
                          </div>
                          {p.fulfilledAt && (
                            <p className="text-[10px] text-[#107C55] dark:text-[#34D399] mt-1.5 pl-5 font-mono">
                              Settled on: {new Date(p.fulfilledAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          )}
                        </div>
                      ) : (
                        <span className="text-ink-muted text-xs italic">No notes recorded</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 align-top text-right whitespace-nowrap">
                      {isActive && (
                        <div className="flex items-center justify-end gap-1.5">
                          <a
                            href={`/pay/${p.transactionId}`}
                            target="_blank"
                            rel="noreferrer"
                            className="px-2.5 py-1 rounded-md bg-[#EEF2FF] hover:bg-[#E0E7FF] dark:bg-[#1E4BF0]/15 text-[#1E4BF0] dark:text-[#60A5FA] border border-[#C7D7FE] dark:border-[#1E4BF0]/30 text-[11px] font-medium transition-all shadow-xs cursor-pointer inline-flex items-center gap-1 hover:scale-[1.02] active:scale-[0.98]"
                            title="Open customer payment link"
                          >
                            <span>Pay Link</span>
                            <ExternalLink size={10} />
                          </a>
                          <button
                            type="button"
                            onClick={() => handleFulfill(p.promiseId)}
                            disabled={actionLoading === p.promiseId}
                            className="px-2.5 py-1 rounded-md bg-[#EBF7F2] hover:bg-[#D1FAE5] dark:bg-[#10B981]/15 text-[#107C55] dark:text-[#34D399] border border-[#BFE7D5] dark:border-[#10B981]/30 text-[11px] font-medium transition-all shadow-xs cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
                          >
                            Mark Paid
                          </button>
                          <button
                            type="button"
                            onClick={() => handleEscalate(p.promiseId)}
                            disabled={actionLoading === p.promiseId}
                            className="px-2.5 py-1 rounded-md bg-[#FEF8EC] hover:bg-[#FEF3C7] dark:bg-[#F59E0B]/15 text-[#B4710A] dark:text-[#F59E0B] border border-[#F8E3B6] dark:border-[#F59E0B]/30 text-[11px] font-medium transition-all shadow-xs cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
                          >
                            Escalate
                          </button>
                        </div>
                      )}
                      {!isActive && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono text-ink-muted bg-surface-secondary border border-border-subtle">
                          Logged
                        </span>
                      )}
                    </td>
                  </motion.tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
