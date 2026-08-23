import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronRight,
  Search,
  MessageSquare,
  AlertTriangle
} from 'lucide-react';
import {
  FAILURE_TYPE_SHORT,
  FAILURE_TYPE_BADGE,
  STATUS_CONFIG,
  ACTION_LABELS,
  ACTION_BADGES,
  formatINR,
  titleCase
} from '../lib/utils';
import AuditDialog from './AuditDialog';
import MessagePreviewModal from './MessagePreviewModal';

export default function RiskExceptionsTable({ transactions = [], loading = false, guardrails = null }) {
  const [selectedTx, setSelectedTx] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);
  const [auditLoading, setAuditLoading] = useState(false);
  const [previewMsgTx, setPreviewMsgTx] = useState(null);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const highValueThreshold = guardrails?.highValueThreshold || 50000;
  const maxRetriesThreshold = guardrails?.maxRetryAttempts || 3;
  const thresholdLabel = highValueThreshold >= 100000
    ? `₹${(highValueThreshold / 100000).toFixed(1).replace('.0', '')}L`
    : `₹${Math.round(highValueThreshold / 1000)}k`;

  const txList = Array.isArray(transactions) ? transactions : [];

  async function handleRowClick(tx) {
    setSelectedTx(tx);
    setAuditLoading(true);
    try {
      const res = await fetch(`/api/transactions/${tx.transactionId}/audit`);
      const data = await res.json();
      setAuditLogs(data.auditLogs || []);
    } catch {
      setAuditLogs([]);
    } finally {
      setAuditLoading(false);
    }
  }

  // Filter transactions
  const filtered = txList.filter(tx => {
    const q = search.toLowerCase();
    const matchSearch = !q ||
      tx.customerName?.toLowerCase().includes(q) ||
      tx.transactionId?.toLowerCase().includes(q) ||
      (tx.classifierOutput?.rootCause && tx.classifierOutput.rootCause.toLowerCase().includes(q));

    const matchCategory = categoryFilter === 'all' || tx.failureType === categoryFilter;

    let matchTab = true;
    if (activeTab === 'recovered') matchTab = tx.status === 'recovered';
    else if (activeTab === 'escalated') matchTab = tx.status === 'exception';
    else if (activeTab === 'high_risk') matchTab = tx.amount > 50000 || tx.attemptCount >= 3;
    else if (activeTab === 'pending') matchTab = tx.status === 'pending';

    return matchSearch && matchCategory && matchTab;
  });

  return (
    <>
      <div className="luxury-card bg-surface border-border overflow-hidden">
        {/* Table Header & Controls */}
        <div className="p-5 border-b border-border space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-semibold text-ink">
                  Exceptions & Transaction Telemetry
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-surface-tertiary text-ink-secondary">
                  Audited Logs
                </span>
              </div>
              <p className="text-xs text-ink-muted mt-0.5">
                Inspect AI reasoning, policy overrides, and multi-channel customer recovery dispatches
              </p>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
              <input
                type="text"
                placeholder="Search payment ID, customer..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="bg-surface-secondary border border-border focus:border-[#1E4BF0] rounded-lg pl-8 pr-3 py-1.5 text-xs text-ink placeholder-ink-muted focus:outline-none w-64 transition-all"
              />
            </div>
          </div>

          {/* Filter Tabs Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-border">
            <div className="flex items-center gap-1.5 overflow-x-auto">
              {[
                { id: 'all', label: 'All Transactions', count: transactions.length },
                { id: 'recovered', label: 'Auto-Recovered', count: transactions.filter(t => t.status === 'recovered').length },
                { id: 'escalated', label: 'Awaiting Review', count: transactions.filter(t => t.status === 'exception').length },
                { id: 'high_risk', label: 'High Risk / Bounded', count: transactions.filter(t => t.amount > highValueThreshold || t.attemptCount >= maxRetriesThreshold).length },
                { id: 'pending', label: 'Pending Queue', count: transactions.filter(t => t.status === 'pending').length },
              ].map(tab => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all cursor-pointer ${
                    activeTab === tab.id
                      ? 'bg-ink text-canvas shadow-xs'
                      : 'text-ink-secondary hover:text-ink hover:bg-surface-tertiary'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span className={`text-[10px] font-mono px-1 rounded ${activeTab === tab.id ? 'bg-white/20 text-white dark:bg-black/40' : 'bg-surface-muted text-ink-secondary'}`}>
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>

            <span className="text-[11px] font-mono text-ink-muted hidden sm:block">
              Click any transaction row to inspect 4-stage audit trail
            </span>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-border bg-surface-secondary text-[11px] font-semibold text-ink-muted uppercase tracking-wider">
                <th className="py-3 px-5">Customer & ID</th>
                <th className="py-3 px-4">Failure Mode</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">AI Diagnostic</th>
                <th className="py-3 px-4">Risk Policy</th>
                <th className="py-3 px-4">Outcome</th>
                <th className="py-3 px-4 text-right">Action Dispatch</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border font-sans">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-ink-muted">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-[#1E4BF0] border-t-transparent rounded-full animate-spin" />
                      <span className="text-xs font-mono">Loading telemetry transactions...</span>
                    </div>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-ink-muted font-mono">
                    <p>No transactions match the selected filter</p>
                    <p className="text-[11px] mt-0.5">Try resetting search or adjusting category tabs</p>
                  </td>
                </tr>
              ) : (
                filtered.map((tx) => {
                  const statusInfo = STATUS_CONFIG[tx.status] || STATUS_CONFIG.pending;
                  const isHighValue = tx.amount > highValueThreshold;
                  const isHighAttempts = tx.attemptCount >= maxRetriesThreshold;

                  return (
                    <tr
                      key={tx.transactionId}
                      onClick={() => handleRowClick(tx)}
                      className="table-row-hover group cursor-pointer"
                    >
                      <td className="py-3.5 px-5">
                        <p className="font-semibold text-ink leading-tight group-hover:text-[#1E4BF0] dark:group-hover:text-[#60A5FA] transition-colors">
                          {tx.customerName}
                        </p>
                        <p className="text-[10px] font-mono text-ink-muted mt-0.5">
                          {tx.transactionId}
                        </p>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-medium border ${FAILURE_TYPE_BADGE[tx.failureType] || 'bg-surface-tertiary'}`}>
                          {FAILURE_TYPE_SHORT[tx.failureType] || tx.failureType}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 font-bold text-ink tnum whitespace-nowrap">
                        {formatINR(tx.amount)}
                      </td>

                      <td className="py-3.5 px-4 max-w-xs">
                        {tx.classifierOutput ? (
                          <div>
                            <p className="font-medium text-ink truncate max-w-[200px]" title={tx.classifierOutput.rootCause}>
                              {titleCase(tx.classifierOutput.rootCause)}
                            </p>
                            <span className="text-[10px] text-slate-400 dark:text-slate-300 font-mono">
                              {tx.classifierOutput.confidence?.toUpperCase()} confidence
                            </span>
                          </div>
                        ) : (
                          <span className="text-ink-muted/50 font-mono text-[11px]">—</span>
                        )}
                      </td>

                      {/* Risk / Policy Tag */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {isHighValue ? (
                          <span className="inline-flex items-center gap-1 text-[10px] text-[#B4710A] dark:text-[#F59E0B] bg-[#FEF8EC] dark:bg-[#F59E0B]/10 border border-[#F8E3B6] dark:border-[#F59E0B]/30 px-1.5 py-0.5 rounded font-mono">
                            <AlertTriangle size={10} />
                            &gt;{thresholdLabel} Guard
                          </span>
                        ) : isHighAttempts ? (
                          <span className="inline-flex items-center gap-1 text-[10px] text-[#B4710A] dark:text-[#F59E0B] bg-[#FEF8EC] dark:bg-[#F59E0B]/10 border border-[#F8E3B6] dark:border-[#F59E0B]/30 px-1.5 py-0.5 rounded font-mono">
                            ≥{maxRetriesThreshold} Retries
                          </span>
                        ) : (
                          <span className="text-[10px] text-[#107C55] dark:text-[#34D399] font-mono">
                            Standard Risk
                          </span>
                        )}
                      </td>

                      {/* Outcome Status */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-medium border ${statusInfo.badge}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${statusInfo.dot}`} />
                          {statusInfo.label}
                        </span>
                      </td>

                      {/* Direct Message Preview Action */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap" onClick={e => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={() => setPreviewMsgTx(tx)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-surface-secondary hover:bg-surface-tertiary text-ink-secondary hover:text-[#1E4BF0] dark:hover:text-[#60A5FA] border border-border hover:border-border-strong text-[11px] font-medium transition-colors cursor-pointer"
                          title="Preview WhatsApp, Voice, Email recovery templates"
                        >
                          <MessageSquare size={11} />
                          <span>Preview</span>
                        </button>
                      </td>

                      {/* Chevron */}
                      <td className="py-3.5 pr-4 text-ink-muted group-hover:text-ink transition-colors">
                        <ChevronRight size={13} />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div className="p-4 border-t border-border bg-surface-secondary flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-ink-secondary">
          <span>Showing {filtered.length} of {transactions.length} records</span>
          <div className="flex items-center gap-3 text-[11px] font-mono">
            <span className="text-[#107C55] dark:text-[#34D399]">● {transactions.filter(t => t.status === 'recovered').length} Recovered</span>
            <span className="text-[#B4710A] dark:text-[#F59E0B]">● {transactions.filter(t => t.status === 'exception').length} Escalated</span>
            <span className="text-[#C73535] dark:text-[#EF4444]">● {transactions.filter(t => t.status === 'flagged').length} Ambiguous</span>
            <span className="text-ink-muted">● {transactions.filter(t => t.status === 'pending').length} Pending</span>
          </div>
        </div>
      </div>

      {/* Audit Trail Drawer / Dialog */}
      <AnimatePresence>
        {selectedTx && (
          <AuditDialog
            transaction={selectedTx}
            auditLogs={auditLoading ? [] : auditLogs}
            open={!!selectedTx}
            onClose={() => { setSelectedTx(null); setAuditLogs([]); }}
          />
        )}
      </AnimatePresence>

      {/* Direct Recovery Communication Preview Modal */}
      <AnimatePresence>
        {previewMsgTx && (
          <MessagePreviewModal
            transaction={previewMsgTx}
            open={!!previewMsgTx}
            onClose={() => setPreviewMsgTx(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
