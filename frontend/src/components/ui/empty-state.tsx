import * as React from 'react';
import { cn } from '../../lib/utils';

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

/**
 * Consistent empty state used across pages — replaces the
 * page-local empty markup in dashboard, tasks, and chat.
 */
export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn('text-center py-12 px-6', className)}>
      <div className="mx-auto w-16 h-16 rounded-full bg-surface-muted flex items-center justify-center mb-4">
        <span className="text-ink-subtle" aria-hidden="true">{icon}</span>
      </div>
      <h3 className="text-lg font-bold text-ink mb-1">{title}</h3>
      {description && <p className="text-sm text-ink-muted mb-6 max-w-sm mx-auto">{description}</p>}
      {action}
    </div>
  );
}
