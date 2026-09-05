import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import CountUp from 'react-countup';

export interface StatCardProps {
  /** Tile label (sentence case, no trailing colon) */
  label: string;
  /** Numeric value rendered with a CountUp entrance */
  value: number;
  /** Optional short hint under the value */
  hint?: string;
  /** Lucide icon component */
  icon: React.ElementType;
  /** Accent classes: soft tinted chip background + icon color */
  iconClass: string;
  /**
   * Soft gradient wash classes for the card body — gives each stat its own
   * tinted surface (e.g. 'from-violet-50/80'). Keep the white end implicit.
   */
  wash?: string;
  /** 12-point sparkline data (last 12 periods, ascending). Omit to hide. */
  spark?: number[];
  /** Stagger index for entrance animation */
  index?: number;
}

/**
 * KPI stat tile — light surface with a per-accent gradient wash, tinted icon
 * chip, animated CountUp value, optional de-emphasis sparkline. Values use
 * proportional figures (no tabular-nums) per the stat-tile contract.
 */
export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  hint,
  icon: Icon,
  iconClass,
  wash,
  spark,
  index = 0,
}) => {
  const reduceMotion = useReducedMotion();

  // Sparkline polyline points, scaled to a 100x28 viewport
  const sparkPoints = spark && spark.length > 1
    ? (() => {
        const max = Math.max(...spark, 1);
        return spark
          .map((v, i) => {
            const x = (i / (spark.length - 1)) * 100;
            const y = 28 - (v / max) * 24;
            return `${x},${y}`;
          })
          .join(' ');
      })()
    : null;

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 16, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, delay: 0.06 * index, ease: 'easeOut' }}
      whileHover={reduceMotion ? undefined : { y: -4 }}
      className={`group relative rounded-card border border-ink-border/70 shadow-subtle hover:shadow-card hover:border-ink-border transition-all duration-200 p-5 overflow-hidden bg-gradient-to-br ${
        wash || 'from-white'
      } to-white`}
    >
      {/* Hover accent — tint sweep from the left */}
      <div
        className="absolute inset-x-0 top-0 h-1 origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300 bg-gradient-to-r from-primary-500 to-violet-500"
        aria-hidden="true"
      />

      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-sm font-medium text-ink-muted">{label}</p>
          <p className="text-3xl font-semibold text-ink mt-1 leading-none">
            <CountUp end={value} duration={reduceMotion ? 0 : 1.2} separator="," />
          </p>
        </div>
        <div className={`w-11 h-11 rounded-input flex items-center justify-center shadow-subtle ${iconClass}`}>
          <Icon className="w-5 h-5" aria-hidden="true" />
        </div>
      </div>

      {/* Sparkline — de-emphasis hue, current period highlighted */}
      {sparkPoints && (
        <svg
          viewBox="0 0 100 28"
          preserveAspectRatio="none"
          className="w-full h-7 mt-1"
          aria-hidden="true"
        >
          <motion.polyline
            points={sparkPoints}
            fill="none"
            stroke="#94a3b8"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={reduceMotion ? false : { pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.9, delay: 0.3 + 0.06 * index, ease: 'easeOut' }}
          />
          {/* End dot — 2px surface ring keeps it legible */}
          {(() => {
            const max = Math.max(...spark!, 1);
            const lastX = 100;
            const lastY = 28 - (spark![spark!.length - 1] / max) * 24;
            return (
              <motion.circle
                cx={lastX}
                cy={lastY}
                r="3"
                fill="#2563eb"
                stroke="#ffffff"
                strokeWidth="2"
                initial={reduceMotion ? false : { scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 1.1 + 0.06 * index, type: 'spring', stiffness: 300, damping: 15 }}
              />
            );
          })()}
        </svg>
      )}

      {hint && <p className="text-xs text-ink-subtle mt-2">{hint}</p>}
    </motion.div>
  );
};
