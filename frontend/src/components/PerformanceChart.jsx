import { useState } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';
import { formatINR, FAILURE_TYPE_LABELS } from '../lib/utils';
import { BarChart3 } from 'lucide-react';
import { useTheme } from '../lib/useTheme';

const SHORT_NAMES = {
  payment_degradation: 'Degradation',
  checkout_abandonment: 'Abandonment',
  subscription_failure: 'Subscription',
  overdue_receivable: 'Receivable',
};

function buildChartData(byType) {
  if (!byType) return [];
  return Object.entries(byType).map(([key, val]) => ({
    key,
    name: SHORT_NAMES[key] || key,
    fullName: FAILURE_TYPE_LABELS[key] || key,
    recovered: val.recovered || 0,
    recoveredAmount: val.recoveredAmount || 0,
    escalated: val.pending || 0,
    total: val.total || 0,
    rate: val.total > 0 ? ((val.recovered / val.total) * 100).toFixed(1) : 0,
  }));
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  const data = payload[0]?.payload;

  return (
    <div className="bg-surface border border-border rounded-xl p-3.5 shadow-dropdown text-xs min-w-[200px]">
      <p className="font-semibold text-ink mb-2">{data?.fullName || label}</p>
      <div className="space-y-1.5 font-mono text-[11px]">
        <div className="flex justify-between items-center text-[#107C55] dark:text-[#34D399]">
          <span>Recovered:</span>
          <span className="font-bold">{data?.recovered} txns ({formatINR(data?.recoveredAmount)})</span>
        </div>
        <div className="flex justify-between items-center text-ink-secondary">
          <span>Escalated / Pending:</span>
          <span className="font-medium">{data?.escalated} txns</span>
        </div>
        <div className="pt-1.5 border-t border-border flex justify-between items-center text-ink font-sans">
          <span className="text-ink-muted">Category Yield:</span>
          <span className="font-bold text-[#107C55] dark:text-[#34D399]">{data?.rate}%</span>
        </div>
      </div>
    </div>
  );
};

export default function PerformanceChart({ metrics, hasBatch }) {
  const [timeRange, setTimeRange] = useState('7D');
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const data = buildChartData(metrics?.byType);

  return (
    <div className="luxury-card p-6 bg-surface border-border">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold text-ink">
              Recovery Performance Analytics
            </h2>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-surface-tertiary text-ink-secondary">
              Telemetry
            </span>
          </div>
          <p className="text-xs text-ink-muted mt-0.5">
            Breakdown of autonomous capital recovery and escalation ratios by failure channel
          </p>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3 self-start sm:self-auto">
          {/* Time Range Pills */}
          <div className="flex items-center p-0.5 rounded-lg bg-surface-tertiary border border-border text-xs font-medium">
            {['24H', '7D', '30D', '90D'].map((range) => (
              <button
                key={range}
                type="button"
                onClick={() => setTimeRange(range)}
                className={`px-2.5 py-1 rounded-md text-[11px] transition-all cursor-pointer ${
                  timeRange === range
                    ? 'bg-surface text-ink font-semibold shadow-xs'
                    : 'text-ink-muted hover:text-ink'
                }`}
              >
                {range}
              </button>
            ))}
          </div>

          {/* Legend */}
          <div className="hidden md:flex items-center gap-3 text-xs text-ink-secondary">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-[#107C55] dark:bg-[#10B981]" />
              <span className="text-[11px]">Recovered</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-[#D0D0C8] dark:bg-[#353B4A]" />
              <span className="text-[11px]">Escalated / Pending</span>
            </div>
          </div>
        </div>
      </div>

      {/* Chart Canvas */}
      {!hasBatch ? (
        <div className="h-56 flex flex-col items-center justify-center gap-2 border border-dashed border-border rounded-xl bg-surface-secondary text-ink-muted">
          <BarChart3 size={24} className="text-ink-muted/50" />
          <p className="text-xs font-medium text-ink-secondary">Awaiting Batch Execution Telemetry</p>
          <p className="text-[11px]">Run a batch to populate financial performance charts</p>
        </div>
      ) : (
        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} barGap={6} barCategoryGap="28%">
              <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#222834' : '#F0F0EB'} vertical={false} />
              <XAxis
                dataKey="name"
                tick={{ fill: isDark ? '#9DA3B2' : '#60605A', fontSize: 11 }}
                axisLine={{ stroke: isDark ? '#272C36' : '#E2E2DC' }}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: isDark ? '#646B7D' : '#8C8C84', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)' }} />
              <Bar dataKey="recovered" name="Recovered" fill={isDark ? '#10B981' : '#107C55'} radius={[4, 4, 0, 0]} />
              <Bar dataKey="escalated" name="Escalated / Pending" fill={isDark ? '#353B4A' : '#D0D0C8'} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Footer Metrics Row */}
      {hasBatch && (
        <div className="mt-4 pt-4 border-t border-border grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          {data.map((item) => (
            <div key={item.key} className="p-2.5 rounded-lg bg-surface-secondary border border-border-subtle">
              <p className="text-[11px] text-ink-muted truncate">{item.name}</p>
              <p className="text-sm font-bold text-ink tnum mt-0.5">
                {formatINR(item.recoveredAmount)}
              </p>
              <p className="text-[10px] text-[#107C55] dark:text-[#34D399] font-medium mt-0.5">
                {item.recovered} / {item.total} recovered ({item.rate}%)
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
