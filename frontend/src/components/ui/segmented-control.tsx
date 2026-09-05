import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { cn } from '../../lib/utils';

export interface SegmentedControlOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
  /**
   * Semantic accent — per-option color. When set, chips render as outlined
   * pills with a leading dot; the active chip fills in its own accent.
   * When absent, chips share the primary/violet gradient accent.
   */
  accent?: 'primary' | 'violet' | 'success' | 'warning' | 'danger' | 'neutral';
  /** Optional count rendered as a badge on the chip */
  count?: number;
}

interface SegmentedControlProps {
  options: SegmentedControlOption[];
  value: string;
  onChange: (value: string) => void;
  ariaLabel: string;
  /** Chip style: 'chip' = outlined semantic pills, 'bar' = joined segmented bar */
  variant?: 'chip' | 'bar';
  className?: string;
}

/** Active fill + inactive hover classes per accent */
const activeFill: Record<string, string> = {
  primary: 'bg-primary-600 border-primary-600 text-white shadow-glow-primary',
  violet: 'bg-violet-600 border-violet-600 text-white shadow-[0_4px_16px_rgba(124,58,237,0.25)]',
  success: 'bg-success-600 border-success-600 text-white shadow-[0_4px_16px_rgba(22,163,74,0.25)]',
  warning: 'bg-warning-600 border-warning-600 text-white shadow-[0_4px_16px_rgba(217,119,6,0.25)]',
  danger: 'bg-danger-600 border-danger-600 text-white shadow-[0_4px_16px_rgba(220,38,38,0.25)]',
  neutral: 'bg-ink border-ink text-white shadow-card',
};

/** Dot color — shared by idle (solid) and active (white-ish) states */
const dotColor: Record<string, string> = {
  primary: 'bg-primary-500',
  violet: 'bg-violet-500',
  success: 'bg-success-500',
  warning: 'bg-warning-500',
  danger: 'bg-danger-500',
  neutral: 'bg-ink-subtle',
};

const dotColorActive: Record<string, string> = {
  primary: 'bg-white',
  violet: 'bg-white',
  success: 'bg-white',
  warning: 'bg-white',
  danger: 'bg-white',
  neutral: 'bg-white',
};

/** Idle chip: tinted border + text, hover deepens the tint */
const idleChip: Record<string, string> = {
  primary: 'border-primary-200 bg-primary-50/50 text-primary-700 hover:bg-primary-50 hover:border-primary-300',
  violet: 'border-violet-200 bg-violet-50/50 text-violet-700 hover:bg-violet-50 hover:border-violet-300',
  success: 'border-success-200 bg-success-50/50 text-success-700 hover:bg-success-50 hover:border-success-300',
  warning: 'border-warning-200 bg-warning-50/50 text-warning-700 hover:bg-warning-50 hover:border-warning-300',
  danger: 'border-danger-200 bg-danger-50/50 text-danger-700 hover:bg-danger-50 hover:border-danger-300',
  neutral: 'border-ink-border bg-white text-ink-muted hover:bg-surface-muted',
};

/** Count badge classes per state */
const countIdle: Record<string, string> = {
  primary: 'bg-primary-100 text-primary-700',
  violet: 'bg-violet-100 text-violet-700',
  success: 'bg-success-100 text-success-700',
  warning: 'bg-warning-100 text-warning-700',
  danger: 'bg-danger-100 text-danger-700',
  neutral: 'bg-surface-muted text-ink-muted',
};

/**
 * Segmented filter control — outlined chips with semantic accents and
 * leading dots. Active chip fills in its own accent color with a spring
 * pop; the dot inverts to white. Optional count badges. Respects
 * prefers-reduced-motion.
 */
export const SegmentedControl: React.FC<SegmentedControlProps> = ({
  options,
  value,
  onChange,
  ariaLabel,
  variant = 'chip',
  className,
}) => {
  const reduceMotion = useReducedMotion();

  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      className={cn(
        'flex items-center',
        variant === 'bar' && 'bg-surface-muted/70 rounded-full p-1 gap-1',
        variant === 'chip' && 'flex-wrap gap-2',
        className
      )}
    >
      {options.map((option) => {
        const active = option.value === value;
        const accent = option.accent || 'primary';

        // bar variant: shared gradient indicator (no per-option accents)
        if (variant === 'bar') {
          return (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => onChange(option.value)}
              className={cn(
                'relative inline-flex items-center gap-1.5 text-sm font-semibold transition-colors duration-200 cursor-pointer',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600/40 rounded-full',
                'px-4 py-1.5',
                active ? 'text-white' : 'text-ink-muted hover:text-ink'
              )}
            >
              {active && (
                <motion.span
                  layoutId={`${ariaLabel}-active`}
                  className="absolute inset-0 rounded-full bg-gradient-to-r from-primary-600 to-primary-500 shadow-glow-primary"
                  transition={
                    reduceMotion
                      ? { duration: 0 }
                      : { type: 'spring', stiffness: 400, damping: 32 }
                  }
                  aria-hidden="true"
                />
              )}
              {option.icon && (
                <span className="relative z-10" aria-hidden="true">
                  {option.icon}
                </span>
              )}
              <span className="relative z-10">{option.label}</span>
            </button>
          );
        }

        // chip variant: outlined semantic pill
        return (
          <motion.button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(option.value)}
            whileTap={reduceMotion ? undefined : { scale: 0.94 }}
            whileHover={reduceMotion ? undefined : { y: -1 }}
            animate={
              active && !reduceMotion
                ? { scale: [1, 1.04, 1] }
                : { scale: 1 }
            }
            transition={active ? { duration: 0.3, ease: 'easeOut' } : { duration: 0.15 }}
            className={cn(
              'relative inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border',
              'text-sm font-semibold tracking-tight cursor-pointer select-none',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600/40',
              'transition-colors duration-200',
              active ? activeFill[accent] : idleChip[accent]
            )}
          >
            {/* Leading dot — inverts on active */}
            <motion.span
              className={cn(
                'w-1.5 h-1.5 rounded-full',
                active ? dotColorActive[accent] : dotColor[accent]
              )}
              animate={active && !reduceMotion ? { scale: [1, 1.4, 1] } : { scale: 1 }}
              transition={{ duration: 0.3 }}
              aria-hidden="true"
            />

            <span>{option.label}</span>

            {/* Count badge */}
            {option.count !== undefined && (
              <span
                className={cn(
                  'ml-0.5 min-w-[1.25rem] h-5 px-1.5 rounded-full text-[11px] font-bold',
                  'flex items-center justify-center tabular-nums leading-none',
                  active ? 'bg-white/20 text-white' : countIdle[accent]
                )}
              >
                {option.count}
              </span>
            )}
          </motion.button>
        );
      })}
    </div>
  );
};
