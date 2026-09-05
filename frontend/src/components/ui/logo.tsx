import React, { useId } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { cn } from '../../lib/utils';

interface LogoProps {
  /** Icon size in px (width & height) */
  size?: number;
  /** Show the "TodoApp" wordmark next to the icon */
  showWordmark?: boolean;
  /** Classes for the wordmark text (e.g. text-white on dark backgrounds) */
  wordmarkClassName?: string;
  /** Extra classes for the root wrapper */
  className?: string;
}

/**
 * Brand logo — gradient rounded square with an animated checkmark draw-in.
 * Matches the favicon (public/favicon.svg). Respects prefers-reduced-motion.
 */
export const Logo: React.FC<LogoProps> = ({
  size = 32,
  showWordmark = false,
  wordmarkClassName,
  className,
}) => {
  const reduceMotion = useReducedMotion();
  // Unique gradient id so multiple logos on one page don't collide
  const gradientId = `todo-logo-gradient-${useId()}`;

  return (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <motion.svg
        width={size}
        height={size}
        viewBox="0 0 48 48"
        aria-hidden="true"
        className="shrink-0 drop-shadow-sm transition-transform duration-200 group-hover:scale-105"
        whileHover={reduceMotion ? undefined : { scale: 1.08, rotate: -3 }}
        whileTap={reduceMotion ? undefined : { scale: 0.92 }}
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
            <stop stopColor="#2563EB" />
            <stop offset="1" stopColor="#7C3AED" />
          </linearGradient>
        </defs>
        <rect width="48" height="48" rx="12" fill={`url(#${gradientId})`} />
        <motion.path
          d="M14 24.5l7 7 13-14"
          fill="none"
          stroke="#ffffff"
          strokeWidth="4.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={reduceMotion ? { pathLength: 1 } : { pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.55, ease: 'easeOut', delay: 0.15 }}
        />
      </motion.svg>
      {showWordmark && (
        <span className={cn('font-display text-xl font-bold tracking-tight text-ink', wordmarkClassName)}>
          TodoApp
        </span>
      )}
    </span>
  );
};
