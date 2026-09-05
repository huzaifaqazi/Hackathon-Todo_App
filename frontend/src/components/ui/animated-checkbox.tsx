import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';

interface AnimatedCheckboxProps {
  checked: boolean;
  onChange: () => void;
  label: string;
  /** Size in px (default 26) */
  size?: number;
  disabled?: boolean;
  busy?: boolean;
  /** Round (default) vs rounded-square style */
  variant?: 'round' | 'square';
}

/**
 * Animated checkbox — SVG check path draw-in + spring fill color change,
 * press scale feedback, optional busy spinner. Shared by dashboard and
 * tasks pages. Respects prefers-reduced-motion.
 */
export const AnimatedCheckbox: React.FC<AnimatedCheckboxProps> = ({
  checked,
  onChange,
  label,
  size = 26,
  disabled = false,
  busy = false,
  variant = 'round',
}) => {
  const reduceMotion = useReducedMotion();

  return (
    <button
      type="button"
      onClick={onChange}
      disabled={disabled || busy}
      role="checkbox"
      aria-checked={checked}
      aria-label={label}
      className={cn(
        'shrink-0 cursor-pointer rounded-full focus-visible:outline-none focus-visible:ring-2',
        'focus-visible:ring-primary-600/40 disabled:opacity-60 transition-transform duration-200',
        !disabled && !busy && 'hover:scale-110'
      )}
    >
      <motion.span
        whileTap={reduceMotion ? undefined : { scale: 0.85 }}
        className="relative flex items-center justify-center border-2 transition-colors duration-200"
        style={{
          width: size,
          height: size,
          borderRadius: variant === 'round' ? '9999px' : '6px',
          borderColor: checked ? '#16a34a' : '#cbd5e1',
          backgroundColor: checked ? '#16a34a' : 'transparent',
        }}
      >
        <svg
          viewBox="0 0 24 24"
          style={{ width: size * 0.58, height: size * 0.58 }}
          aria-hidden="true"
        >
          <motion.path
            d="M5 12.5l4.5 4.5L19 7.5"
            fill="none"
            stroke="#ffffff"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={false}
            animate={{ pathLength: checked ? 1 : 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          />
        </svg>
        {busy && (
          <Loader2
            className="absolute inset-0 m-auto text-primary-600 animate-spin"
            style={{ width: size * 0.55, height: size * 0.55 }}
            aria-hidden="true"
          />
        )}
      </motion.span>
    </button>
  );
};
