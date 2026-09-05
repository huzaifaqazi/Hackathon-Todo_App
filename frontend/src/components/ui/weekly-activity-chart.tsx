import React, { useEffect, useState } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from 'recharts';
import { motion } from 'framer-motion';

export interface WeeklyActivityDatum {
  day: string;
  count: number;
}

interface WeeklyActivityChartProps {
  data: WeeklyActivityDatum[];
  weekTotal: number;
}

/** Recharts tooltip styled to the design tokens — values lead, label follows */
const ChartTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  const value = payload[0].value as number;
  return (
    <div className="bg-white rounded-input shadow-lifted border border-ink-border px-3 py-2">
      <p className="text-sm font-semibold text-ink leading-none">
        {value} {value === 1 ? 'task' : 'tasks'}
      </p>
      <p className="text-xs text-ink-subtle mt-1">{label}</p>
    </div>
  );
};

/**
 * Weekly activity column chart — built per the dataviz method:
 * - single series (no legend needed; title names it)
 * - thin bars (<=24px), 4px rounded data-end, square at the baseline
 * - recessive 1px solid gridlines, muted axis text in text tokens
 * - per-mark hover: mark is the hit target, lifts on hover
 */
export const WeeklyActivityChart: React.FC<WeeklyActivityChartProps> = ({
  data,
  weekTotal,
}) => {
  const maxCount = Math.max(...data.map((d) => d.count), 1);

  // Recharts ResponsiveContainer measures 0 width during SSR and can stay
  // blank after hydration — render only once mounted on the client.
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="w-full">
      <div className="flex items-baseline justify-between mb-5">
        <h2 className="font-display text-xl font-bold text-ink">Weekly Activity</h2>
        <span className="text-sm text-ink-muted">
          {weekTotal} {weekTotal === 1 ? 'task' : 'tasks'} completed this week
        </span>
      </div>

      <div className="h-52" role="img" aria-label={`Tasks completed per day over the last 7 days: ${data.map((d) => `${d.day} ${d.count}`).join(', ')}`}>
        {mounted ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 8, right: 0, left: -24, bottom: 0 }} barCategoryGap="28%">
              <CartesianGrid stroke="#f1f5f9" strokeWidth={1} vertical={false} />
              <XAxis
                dataKey="day"
                tickLine={false}
                axisLine={{ stroke: '#e2e8f0', strokeWidth: 1 }}
                tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }}
                dy={6}
              />
              <YAxis
                allowDecimals={false}
                tickCount={Math.min(maxCount + 1, 5)}
                tickLine={false}
                axisLine={false}
                tick={{ fill: '#94a3b8', fontSize: 11 }}
              />
              <Tooltip
                content={<ChartTooltip />}
                cursor={{ fill: 'rgba(37, 99, 235, 0.04)' }}
              />
              <Bar
                dataKey="count"
                radius={[4, 4, 0, 0]}
                maxBarSize={24}
                animationDuration={700}
                animationBegin={200}
              >
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.count > 0 ? '#2563eb' : '#e2e8f0'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          // Layout-stable skeleton while mounting — keeps the card height fixed
          <div className="w-full h-full flex items-end justify-between gap-3 px-2" aria-hidden="true">
            {data.map((d) => (
              <div key={d.day} className="flex-1 flex flex-col items-center justify-end h-full gap-1.5">
                <div
                  className="w-full max-w-[24px] rounded-t bg-surface-muted animate-pulse"
                  style={{ height: d.count > 0 ? `${Math.max((d.count / maxCount) * 100, 8)}%` : '4%' }}
                />
                <div className="h-3 w-6 rounded bg-surface-muted animate-pulse" />
              </div>
            ))}
          </div>
        )}
      </div>

      <p className="text-center text-sm text-ink-subtle mt-4">
        Tasks completed in the last 7 days
      </p>
    </div>
  );
};
