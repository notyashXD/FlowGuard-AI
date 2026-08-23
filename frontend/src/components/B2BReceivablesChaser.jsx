import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  AlertCircle,
  Building,
  Mail,
  PhoneCall,
  Clock,
  ArrowRight,
  ExternalLink,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { formatINR, formatNumber } from '../lib/utils';
import MessagePreviewModal from './MessagePreviewModal';

export default function B2BReceivablesChaser({ transactions = [] }) {
  const [previewTx, setPreviewTx] = useState(null);
  const [selectedAging, setSelectedAging] = useState('all');

  const txList = Array.isArray(transactions) ? transactions : [];
  const b2bInvoices = txList.filter(t => t.failureType === 'overdue_receivable');

  const totalOverdueAmount = b2bInvoices.reduce((sum, t) => sum + (t.amount || 0), 0);

  // Group by aging buckets
  const buckets = {
    current: b2bInvoices.filter(t => (t.metadata?.daysOverdue || 0) <= 15),
    overdue: b2bInvoices.filter(t => (t.metadata?.daysOverdue || 0) > 15 && (t.metadata?.daysOverdue || 0) <= 30),
    delinquent: b2bInvoices.filter(t => (t.metadata?.daysOverdue || 0) > 30 && (t.metadata?.daysOverdue || 0) <= 60),
    critical: b2bInvoices.filter(t => (t.metadata?.daysOverdue || 0) > 60),
  };

  const filteredInvoices = b2bInvoices.filter(t => {
    if (selectedAging === '0-15') return (t.metadata?.daysOverdue || 0) <= 15;
    if (selectedAging === '16-30') return (t.metadata?.daysOverdue || 0) > 15 && (t.metadata?.daysOverdue || 0) <= 30;
    if (selectedAging === '31-60') return (t.metadata?.daysOverdue || 0) > 30 && (t.metadata?.daysOverdue || 0) <= 60;
    if (selectedAging === '60+') return (t.metadata?.daysOverdue || 0) > 60;
    return true;
  });

  return (
    <div className="luxury-card p-6 bg-surface border-border space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-[#FEF8EC] dark:bg-[#F59E0B]/15 border border-[#F8E3B6] dark:border-[#F59E0B]/30 flex items-center justify-center text-[#B4710A] dark:text-[#F59E0B]">
            <Building size={14} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-ink">
                B2B Receivables Chaser & Aging Matrix
              </h2>
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-surface-tertiary text-ink border border-border font-semibold">
                Invoice Cadence
              </span>
            </div>
            <p className="text-xs text-ink-muted">
              Automated multi-stage follow-up cadence for corporate accounts and Net-30/60 receivables
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-ink">
          <span>Total Overdue:</span>
          <span className="font-bold text-[#C73535] dark:text-[#EF4444] tnum">{formatINR(totalOverdueAmount)}</span>
        </div>
      </div>

      {/* 4 Aging Buckets */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { id: '0-15', label: '0–15 Days Overdue', list: buckets.current, color: 'text-[#1E4BF0] dark:text-[#60A5FA]', action: 'Gentle Reminders' },
          { id: '16-30', label: '16–30 Days Overdue', list: buckets.overdue, color: 'text-[#B4710A] dark:text-[#F59E0B]', action: 'Finance Team Call' },
          { id: '31-60', label: '31–60 Days Delinquent', list: buckets.delinquent, color: 'text-[#C73535] dark:text-[#EF4444]', action: 'GST Portal Settlement' },
          { id: '60+', label: '60+ Days Critical', list: buckets.critical, color: 'text-[#C73535] dark:text-[#EF4444]', action: 'Legal Routing' },
        ].map(bucket => {
          const totalVal = bucket.list.reduce((s, t) => s + (t.amount || 0), 0);
          const isSelected = selectedAging === bucket.id;

          return (
            <button
              key={bucket.id}
              type="button"
              onClick={() => setSelectedAging(isSelected ? 'all' : bucket.id)}
              className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                isSelected
                  ? 'bg-surface border-[#1E4BF0] dark:border-[#60A5FA] ring-1 ring-[#1E4BF0]/30 shadow-xs'
                  : 'bg-surface-secondary border-border-subtle hover:border-border'
              }`}
            >
              <div className="flex items-center justify-between text-[11px] text-ink-muted mb-1">
                <span>{bucket.label}</span>
                <span className="font-mono text-xs font-bold text-ink">{bucket.list.length}</span>
              </div>
              <p className={`text-base font-bold tnum ${bucket.color}`}>
                {formatINR(totalVal)}
              </p>
              <p className="text-[10px] text-ink-secondary mt-1 truncate">
                Cadence: {bucket.action}
              </p>
            </button>
          );
        })}
      </div>

      {/* Invoice Ledger Table */}
      <div className="overflow-x-auto border border-border rounded-xl">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="bg-surface-secondary border-b border-border text-[10px] font-semibold text-ink-muted uppercase tracking-wider">
              <th className="py-3 px-4">Corporate Entity</th>
              <th className="py-3 px-4">Invoice & GSTIN</th>
              <th className="py-3 px-4">Amount</th>
              <th className="py-3 px-4">Credit Terms</th>
              <th className="py-3 px-4">Days Overdue</th>
              <th className="py-3 px-4">Chaser Cadence Stage</th>
              <th className="py-3 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle bg-surface">
            {filteredInvoices.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-ink-muted">
                  No B2B receivables matching active bucket.
                </td>
              </tr>
            ) : (
              filteredInvoices.map((t) => {
                const days = t.metadata?.daysOverdue || 12;
                const isCritical = days > 30;

                return (
                  <tr key={t.transactionId} className="table-row-hover">
                    <td className="py-3 px-4">
                      <p className="font-semibold text-ink leading-tight">{t.customerName}</p>
                      <p className="text-[10px] text-ink-muted mt-0.5">Contact: {t.metadata?.contactPerson || 'Finance Head'}</p>
                    </td>

                    <td className="py-3 px-4 font-mono text-[11px]">
                      <p className="font-medium text-ink">{t.metadata?.invoiceId || 'INV-2026'}</p>
                      <p className="text-[10px] text-ink-muted">{t.metadata?.gstNumber || 'GST29ABCDE1234Z'}</p>
                    </td>

                    <td className="py-3 px-4 font-bold text-ink tnum whitespace-nowrap">
                      {formatINR(t.amount)}
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap font-mono text-[11px] text-ink-secondary">
                      {t.metadata?.creditTerms || 'NET-30'}
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 font-mono text-[11px] font-semibold ${isCritical ? 'text-[#C73535] dark:text-[#EF4444]' : 'text-[#B4710A] dark:text-[#F59E0B]'}`}>
                        <Clock size={11} />
                        {days} Days Past Due
                      </span>
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="inline-block px-2 py-0.5 rounded text-[10px] font-medium bg-surface-secondary border border-border text-ink-secondary">
                        {days > 30 ? 'Step 3: Escalated to Accounts Lead' : 'Step 1: Automated Payment Link'}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => setPreviewTx(t)}
                        className="px-2.5 py-1 rounded bg-surface-secondary hover:bg-surface-tertiary border border-border text-[11px] font-medium text-ink transition-colors cursor-pointer"
                      >
                        Preview Chaser
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Preview Modal */}
      <AnimatePresence>
        {previewTx && (
          <MessagePreviewModal
            transaction={previewTx}
            open={!!previewTx}
            onClose={() => setPreviewTx(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
