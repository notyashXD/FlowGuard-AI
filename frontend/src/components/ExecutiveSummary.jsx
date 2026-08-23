import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Sparkles, RefreshCw, CheckCircle, AlertCircle, ArrowUpRight } from 'lucide-react';

export default function ExecutiveSummary({ hasBatch, metrics }) {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (hasBatch) {
      fetchSummary();
    }
  }, [hasBatch, metrics?.totalProcessed]);

  async function fetchSummary() {
    setLoading(true);
    try {
      const res = await fetch('/api/metrics/executive-summary', { method: 'POST' });
      const data = await res.json();
      setSummary(data);
    } catch (err) {
      console.error('Failed to load executive summary:', err);
    } finally {
      setLoading(false);
    }
  }

  if (!hasBatch) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="rounded-2xl border border-blue-500/20 bg-gradient-to-br from-blue-950/20 via-[var(--surface-1)] to-emerald-950/15 p-6 relative overflow-hidden"
    >
      {/* Subtle top glow line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-blue-500/40 via-emerald-500/40 to-transparent" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/8">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
            <Sparkles size={16} />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              AI Executive Briefing & Financial Audit
              <span className="text-[10px] font-mono uppercase bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full">
                Auto-Synthesized
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              CFO-level recovery performance digest generated from transaction telemetry
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={fetchSummary}
          disabled={loading}
          className="self-start sm:self-auto flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 text-xs transition-all cursor-pointer disabled:opacity-50"
        >
          <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
          Refresh Briefing
        </button>
      </div>

      {/* Content */}
      {loading && !summary ? (
        <div className="py-8 text-center text-xs text-slate-500 animate-pulse">
          Synthesizing executive briefing from Razorpay audit logs...
        </div>
      ) : summary ? (
        <div className="py-4 space-y-4">
          {/* Headline banner */}
          <div className="p-3.5 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-start gap-3">
            <CheckCircle size={16} className="text-emerald-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-white leading-relaxed">{summary.headline}</p>
              <p className="text-[11px] text-blue-300/80 mt-0.5">
                Targeted recovery rate: <strong className="text-emerald-300">{summary.recoveryRate}</strong> across {summary.processedCount} transactions.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Key Findings */}
            <div className="bg-black/20 border border-white/6 rounded-xl p-4 space-y-2.5">
              <p className="text-[11px] uppercase tracking-wider font-bold text-slate-400">
                Key Telemetry Findings
              </p>
              <ul className="space-y-2">
                {summary.keyFindings?.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-xs text-slate-300 leading-relaxed">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400 flex-shrink-0 mt-1.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Strategic Recommendations */}
            <div className="bg-black/20 border border-white/6 rounded-xl p-4 space-y-2.5">
              <p className="text-[11px] uppercase tracking-wider font-bold text-slate-400">
                Recommended Merchant Actions
              </p>
              <ul className="space-y-2">
                {summary.recommendations?.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-xs text-emerald-300/90 leading-relaxed">
                    <ArrowUpRight size={13} className="text-emerald-400 flex-shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      ) : null}
    </motion.div>
  );
}
