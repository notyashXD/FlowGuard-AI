import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, Legend
} from 'recharts';
import { motion } from 'framer-motion';
import { FAILURE_TYPE_LABELS } from '../lib/utils';

const SHORT = {
  payment_degradation:  'Payment',
  checkout_abandonment: 'Checkout',
  subscription_failure: 'Subscription',
  overdue_receivable:   'Receivable',
};

function buildChartData(byType) {
  if (!byType) return [];
  return Object.entries(byType).map(([key, val]) => ({
    name: SHORT[key] || key,
    fullName: FAILURE_TYPE_LABELS[key] || key,
    recovered: val.recovered || 0,
    escalated: val.pending || 0,
  }));
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#1a1f35] border border-[rgba(255,255,255,0.1)] rounded-xl px-4 py-3 shadow-2xl text-xs">
      <p className="font-semibold text-white mb-2">{payload[0]?.payload?.fullName || label}</p>
      {payload.map(e => (
        <div key={e.name} className="flex items-center gap-2 mb-1">
          <span className="w-2 h-2 rounded-full" style={{ background: e.fill }} />
          <span className="text-slate-400">{e.name}:</span>
          <span className="text-white font-medium ml-auto pl-4">{e.value}</span>
        </div>
      ))}
    </div>
  );
};

export default function RecoveryChart({ metrics, hasBatch }) {
  const data = buildChartData(metrics?.byType);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.15 }}
      className="rounded-2xl border border-[var(--border)] bg-[var(--surface-1)] p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-sm font-semibold text-white">Recovery by Failure Type</h2>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">Recovered vs escalated/pending per category</p>
        </div>
        <div className="flex gap-4 text-xs">
          <span className="flex items-center gap-1.5 text-[var(--text-muted)]">
            <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500 inline-block" />Recovered
          </span>
          <span className="flex items-center gap-1.5 text-[var(--text-muted)]">
            <span className="w-2.5 h-2.5 rounded-sm bg-slate-600 inline-block" />Escalated/Pending
          </span>
        </div>
      </div>

      {!hasBatch ? (
        <div className="h-44 flex flex-col items-center justify-center gap-2 text-[var(--text-dim)]">
          <div className="w-10 h-10 rounded-xl bg-[var(--surface-2)] flex items-center justify-center mb-1">
            <span className="text-xl">📊</span>
          </div>
          <p className="text-sm">No batch run yet</p>
          <p className="text-xs">Click Run Batch to see recovery breakdown</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={210}>
          <BarChart data={data} barGap={3} barCategoryGap="35%">
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
            <XAxis
              dataKey="name"
              tick={{ fill: '#64748b', fontSize: 11 }}
              axisLine={false} tickLine={false}
            />
            <YAxis
              tick={{ fill: '#64748b', fontSize: 11 }}
              axisLine={false} tickLine={false}
              allowDecimals={false}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.02)' }} />
            <Bar dataKey="recovered" name="Recovered" fill="#10b981" radius={[4,4,0,0]} />
            <Bar dataKey="escalated" name="Escalated/Pending" fill="#334155" radius={[4,4,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </motion.div>
  );
}
