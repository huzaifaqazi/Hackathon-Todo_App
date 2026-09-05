import * as React from 'react';
import { cn } from '../../lib/utils';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  label?: string;
}

const sizeClasses = {
  sm: 'h-4 w-4 border-2',
  md: 'h-8 w-8 border-2',
  lg: 'h-12 w-12 border-[3px]',
};

/**
 * Loading spinner with optional accessible label.
 * Replaces the ad-hoc animate-spin divs scattered across pages.
 */
export function Spinner({ size = 'md', className, label }: SpinnerProps) {
  return (
    <div
      role={label ? 'status' : undefined}
      aria-live={label ? 'polite' : undefined}
      className={cn('flex items-center justify-center gap-2', className)}
    >
      <div
        className={cn(
          'animate-spin rounded-full border-ink-border border-t-primary-600',
          sizeClasses[size]
        )}
      />
      {label && <span className="text-sm text-ink-muted">{label}</span>}
    </div>
  );
}

/** Full-block loading state for page-level data fetches */
export function LoadingState({ label = 'Loading...' }: { label?: string }) {
  return (
    <div className="flex items-center justify-center py-20">
      <Spinner size="lg" label={label} />
    </div>
  );
}
