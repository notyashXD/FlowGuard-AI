import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Search, MessageSquare, Shield, SlidersHorizontal } from 'lucide-react';
import {
  FAILURE_TYPE_LABELS, STATUS_CONFIG, ACTION_LABELS, ACTION_COLORS,
  FAILURE_TYPE_BADGE, formatINR, timeAgo,
} from '../lib/utils';
import AuditDialog from './AuditDialog';
import MessagePreviewModal from './MessagePreviewModal';

const TYPE_SHORT = {
  payment_degradation:  'Degradation',
  checkout_abandonment: 'Abandonment',
  subscription_failure: 'Subscription',
  overdue_receivable:   'Receivable',
};

export default function TransactionTable({ transactions, loading }) {
  const [selectedTx, setSelectedTx] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);
  const [auditLoading, setAuditLoading] = useState(false);
  const [previewMsgTx, setPreviewMsgTx] = useState(null);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');

  async function handleRowClick(tx) {
    setSelectedTx(tx);
    setAuditLoading(true);
    try {
      const res = await fetch(`/api/transactions/${tx.transactionId}/audit`);
      const data = await res.json();
      setAuditLogs(data.auditLogs || []);
    } catch { setAuditLogs([]); }
    finally { setAuditLoading(false); }
  }

  const filtered = transactions.filter(tx => {
    const q = search.toLowerCase();
    const matchSearch = !q ||
      tx.customerName.toLowerCase().includes(q) ||
      tx.transactionId.toLowerCase().includes(q);
    const matchStatus = filterStatus === 'all' || tx.status === filterStatus;
    const matchCategory = filterCategory === 'all' || tx.failureType === filterCategory;
    return matchSearch && matchStatus && matchCategory;
  });

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.25 }}
        className="rounded-2xl border border-[var(--border)] bg-[var(--surface-1)] overflow-hidden"
      >
        {/* Header toolbar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 px-5 py-4 border-b border-[var(--border)]">
          <div>
            <h2 className="text-sm font-semibold text-white">Audited Transactions & Actions</h2>
            <p className="text-[11px] text-[var(--text-muted)] mt-0.5">Click any row to inspect bounded decision trail or preview recovery dispatch</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Search */}
            <div className="relative">
              <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
              <input
                type="text" placeholder="Search customer / ID..." value={search}
                onChange={e => setSearch(e.target.value)}
                className="bg-[var(--surface-2)] border border-[var(--border)] rounded-lg pl-7 pr-3 py-1.5 text-xs text-slate-300 placeholder-[var(--text-dim)] focus:outline-none focus:border-blue-500/40 w-44"
              />
            </div>

            {/* Category filter */}
            <select
              value={filterCategory} onChange={e => setFilterCategory(e.target.value)}
              className="bg-[var(--surface-2)] border border-[var(--border)] rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-blue-500/40 cursor-pointer"
            >
              <option value="all">All Failure Types</option>
              <option value="payment_degradation">Payment Degradation</option>
              <option value="checkout_abandonment">Checkout Abandonment</option>
              <option value="subscription_failure">Subscription Failure</option>
              <option value="overdue_receivable">Overdue Receivable</option>
            </select>

            {/* Status filter */}
            <select
              value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
              className="bg-[var(--surface-2)] border border-[var(--border)] rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-blue-500/40 cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="recovered">Recovered</option>
              <option value="exception">Escalated</option>
              <option value="flagged">Flagged</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border)]">
                {['Customer', 'Failure Category', 'Amount', 'Attempts', 'Age', 'Final Action', 'Status', 'Communications'].map(col => (
                  <th key={col} className="px-5 py-3 text-left text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-wider whitespace-nowrap">
                    {col}
                  </th>
                ))}
                <th className="w-6" />
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i} className="border-b border-[var(--border)]">
                    {Array.from({ length: 9 }).map((_, j) => (
                      <td key={j} className="px-5 py-3.5">
                        <div className="shimmer h-3.5 rounded" style={{ width: `${40 + Math.random() * 40}%` }} />
                      </td>
                    ))}
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-16">
                    <p className="text-[var(--text-muted)] text-sm">
                      {search || filterStatus !== 'all' || filterCategory !== 'all' ? 'No matching transactions.' : 'No transactions in queue.'}
                    </p>
                  </td>
                </tr>
              ) : (
                filtered.map((tx, i) => {
                  const sc = STATUS_CONFIG[tx.status] || STATUS_CONFIG.pending;
                  return (
                    <motion.tr
                      key={tx.transactionId}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: Math.min(i * 0.01, 0.25) }}
                      onClick={() => handleRowClick(tx)}
                      className="border-b border-[var(--border)] tr-hover group"
                    >
                      <td className="px-5 py-3.5">
                        <p className="font-medium text-white text-sm leading-tight">{tx.customerName}</p>
                        <p className="text-[10px] text-[var(--text-muted)] font-mono mt-0.5">{tx.transactionId.slice(-10)}</p>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${FAILURE_TYPE_BADGE[tx.failureType]}`}>
                          {TYPE_SHORT[tx.failureType]}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-white font-semibold font-display whitespace-nowrap">
                        {formatINR(tx.amount)}
                      </td>
                      <td className="px-5 py-3.5 text-[var(--text-muted)] text-xs">{tx.attemptCount}</td>
                      <td className="px-5 py-3.5 text-[var(--text-muted)] text-xs whitespace-nowrap">{timeAgo(tx.failureTimestamp)}</td>
                      <td className="px-5 py-3.5 text-xs">
                        {tx.finalAction ? (
                          <span className={`font-medium ${ACTION_COLORS[tx.finalAction]}`}>
                            {ACTION_LABELS[tx.finalAction]}
                          </span>
                        ) : <span className="text-[var(--text-dim)]">—</span>}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold border ${sc.bg} ${sc.text}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                          {sc.label}
                        </span>
                      </td>
                      <td className="px-5 py-3.5" onClick={e => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={() => setPreviewMsgTx(tx)}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 text-[11px] transition-colors cursor-pointer"
                          title="Preview WhatsApp / Voice / Email recovery template"
                        >
                          <MessageSquare size={11} />
                          <span>Preview</span>
                        </button>
                      </td>
                      <td className="pr-4 text-[var(--text-dim)] group-hover:text-[var(--text-muted)] transition-colors">
                        <ChevronRight size={14} />
                      </td>
                    </motion.tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Summary */}
        <div className="px-5 py-2.5 border-t border-[var(--border)] flex flex-col sm:flex-row sm:items-center justify-between text-[10px] text-[var(--text-dim)] gap-2">
          <span>Showing {filtered.length} of {transactions.length} records</span>
          <div className="flex items-center gap-3 font-mono">
            <span className="text-emerald-400">● {transactions.filter(t=>t.status==='recovered').length} Recovered</span>
            <span className="text-amber-400">● {transactions.filter(t=>t.status==='exception').length} Escalated</span>
            <span className="text-rose-400">● {transactions.filter(t=>t.status==='flagged').length} Flagged</span>
            <span className="text-slate-500">● {transactions.filter(t=>t.status==='pending').length} Pending</span>
          </div>
        </div>
      </motion.div>

      {/* Audit Dialog */}
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

      {/* Direct Recovery Message Preview Modal */}
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
