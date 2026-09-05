import React from 'react';
import { cn } from '../../lib/utils';

interface GradientButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  /** 'md' = default (hero/CTA), 'sm' = compact (navbar, tight spaces) */
  size?: 'md' | 'sm';
}

/**
 * Gradient-border button — animated gradient frame (purple → indigo → cyan)
 * with an inner solid fill that fades away on hover to reveal the gradient.
 * Press feedback via scale. See design-system for token mapping.
 */
export const GradientButton: React.FC<GradientButtonProps> = ({
  children,
  className,
  size = 'md',
  ...props
}) => (
  <button
    className={cn(
      'group inline-flex items-center justify-center rounded-full p-[2.5px]',
      'text-white whitespace-nowrap cursor-pointer select-none',
      'bg-[linear-gradient(144deg,#af40ff,#5b42f3_50%,#00ddeb)]',
      'shadow-[0_15px_30px_-5px_rgba(151,65,252,0.2)]',
      'transition-all duration-300 hover:-translate-y-0.5 active:scale-90',
      size === 'md' &&
        'text-base font-semibold tracking-tight min-w-[150px] [&>span]:px-8 [&>span]:py-4',
      size === 'sm' &&
        'text-sm font-semibold tracking-tight min-w-[100px] shadow-[0_8px_18px_-6px_rgba(151,65,252,0.25)] [&>span]:px-6 [&>span]:py-2.5',
      className
    )}
    {...props}
  >
    <span
      className={cn(
        'flex items-center justify-center gap-2 w-full h-full rounded-full',
        'bg-[rgb(55,56,152)] transition-colors duration-300 group-hover:bg-transparent'
      )}
    >
      {children}
    </span>
  </button>
);
