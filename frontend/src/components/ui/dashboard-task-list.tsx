import React, { useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Calendar, Loader2, ArrowUpRight, Bot } from 'lucide-react';
import { cn } from '../../lib/utils';
import type { Task } from '../../types/task';
import { formatTaskDueDate } from '../../lib/task-ui';

interface DashboardTaskListProps {
  tasks: Task[];
  /** Toggle completion for a task (async) */
  onToggle: (task: Task) => Promise<void>;
}

/**
 * Priority chip — soft tinted pill with a leading dot.
 * Font: 11px, font-semibold, tracking-wide, sentence case.
 */
const PriorityChip: React.FC<{ priority: string }> = ({ priority }) => {
  const styles = {
    high: 'bg-danger-50 text-danger-700 border-danger-100',
    medium: 'bg-warning-50 text-warning-700 border-warning-100',
    low: 'bg-success-50 text-success-700 border-success-100',
  } as Record<string, string>;
  const dots = {
    high: 'bg-danger-500',
    medium: 'bg-warning-500',
    low: 'bg-success-500',
  } as Record<string, string>;
  const p = (priority || 'medium') as string;

  return (
    <span
      className={cn(
        'hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-[11px] font-semibold tracking-wide',
        styles[p] || 'bg-surface-muted text-ink-muted border-ink-border'
      )}
    >
      <span className={cn('w-1.5 h-1.5 rounded-full', dots[p] || 'bg-ink-subtle')} aria-hidden="true" />
      {p.charAt(0).toUpperCase() + p.slice(1)}
    </span>
  );
};

/**
 * Status chip — outlined pill in the primary family (or neutral when done).
 */
const StatusChip: React.FC<{ status: string; done: boolean }> = ({ status, done }) => (
  <span
    className={cn(
      'hidden md:inline-flex items-center px-2.5 py-0.5 rounded-full border text-[11px] font-semibold tracking-wide',
      done
        ? 'bg-surface-background text-ink-subtle border-ink-border'
        : status === 'in-progress'
        ? 'bg-primary-50 text-primary-700 border-primary-100'
        : 'bg-surface-muted text-ink-muted border-ink-border'
    )}
  >
    {done ? 'Done' : status === 'in-progress' ? 'In Progress' : 'Pending'}
  </span>
);

/**
 * Dashboard recent-tasks list — rows with:
 * - animated SVG checkbox (check path draw + spring fill)
 * - pill-style priority & status chips with leading dots
 * - overdue date rendered as a danger pill chip
 * - staggered entrance, layout-preserving exits, completion burst
 * - typography: title 15px/600, meta 12px, chips 11px/semibold
 */
export const DashboardTaskList: React.FC<DashboardTaskListProps> = ({
  tasks,
  onToggle,
}) => {
  const reduceMotion = useReducedMotion();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [justCompleted, setJustCompleted] = useState<string | null>(null);

  const handleToggle = async (task: Task) => {
    try {
      setBusyId(task.id);
      if (task.status !== 'completed') {
        setJustCompleted(task.id);
        setTimeout(() => setJustCompleted(null), 1200);
      }
      await onToggle(task);
    } finally {
      setBusyId(null);
    }
  };

  if (tasks.length === 0) {
    return (
      <p className="text-sm text-ink-muted py-6 text-center">
        Nothing here yet — create your first task to get rolling.
      </p>
    );
  }

  return (
    <ul className="space-y-2">
      <AnimatePresence initial={false}>
        {tasks.map((task, index) => {
          const done = task.status === 'completed';
          const busy = busyId === task.id;
          const isOverdue =
            !done && task.due_date ? new Date(task.due_date) < new Date() : false;
          const createdLabel = new Date(task.created_at).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
          });

          return (
            <motion.li
              key={task.id}
              layout
              initial={reduceMotion ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.3, delay: Math.min(index * 0.05, 0.25) }}
              className={cn(
                'group relative flex items-center gap-4 rounded-card border px-4 py-3.5',
                'transition-all duration-200 hover:shadow-subtle hover:-translate-y-0.5',
                done
                  ? 'border-ink-border/50 bg-surface-background/60 hover:border-ink-border'
                  : task.priority === 'high'
                  ? 'border-danger-100 bg-danger-50/30 hover:border-danger-200'
                  : task.priority === 'medium'
                  ? 'border-warning-100 bg-warning-50/25 hover:border-warning-200'
                  : 'border-ink-border bg-white hover:border-primary-200'
              )}
            >
              {/* Priority dot rail */}
              <span
                className={cn(
                  'absolute left-0 top-2.5 bottom-2.5 w-1 rounded-full',
                  task.priority === 'high'
                    ? 'bg-danger-500'
                    : task.priority === 'medium'
                    ? 'bg-warning-500'
                    : 'bg-success-500'
                )}
                aria-hidden="true"
              />

              {/* Animated checkbox — round, grows on hover */}
              <button
                type="button"
                onClick={() => handleToggle(task)}
                disabled={busy}
                aria-label={`Mark task "${task.title}" as ${done ? 'pending' : 'completed'}`}
                className="shrink-0 cursor-pointer rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600/40 disabled:opacity-60 transition-transform duration-200 hover:scale-110"
              >
                <motion.span
                  whileTap={reduceMotion ? undefined : { scale: 0.85 }}
                  className="relative flex items-center justify-center w-[26px] h-[26px] rounded-full border-2 transition-colors duration-200"
                  style={{
                    borderColor: done ? '#16a34a' : '#cbd5e1',
                    backgroundColor: done ? '#16a34a' : 'transparent',
                  }}
                >
                  <svg viewBox="0 0 24 24" className="w-[15px] h-[15px]" aria-hidden="true">
                    <motion.path
                      d="M5 12.5l4.5 4.5L19 7.5"
                      fill="none"
                      stroke="#ffffff"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      initial={false}
                      animate={{ pathLength: done ? 1 : 0 }}
                      transition={{ duration: 0.3, ease: 'easeOut' }}
                    />
                  </svg>
                  {busy && (
                    <Loader2 className="absolute inset-0 m-auto w-3.5 h-3.5 text-primary-600 animate-spin" aria-hidden="true" />
                  )}
                </motion.span>
              </button>

              {/* Task info — title 16px/700 display, meta row with created date */}
              <div className="flex-1 min-w-0">
                <p
                  className={cn(
                    'font-display text-base font-bold tracking-tight truncate transition-colors duration-300',
                    done ? 'text-ink-subtle line-through decoration-2' : 'text-ink'
                  )}
                >
                  {task.title}
                </p>
                <div className="flex items-center gap-2 mt-1 text-xs text-ink-subtle font-medium">
                  {task.description ? (
                    <span className="truncate max-w-[16rem] hidden sm:block">
                      {task.description}
                    </span>
                  ) : (
                    <span className="hidden sm:inline-flex items-center gap-1">
                      <Bot className="w-3.5 h-3.5" aria-hidden="true" />
                      Added via AI chat
                    </span>
                  )}
                  {task.description && (
                    <span className="hidden sm:inline text-ink-border" aria-hidden="true">·</span>
                  )}
                  <span className="shrink-0">Added {createdLabel}</span>
                </div>
              </div>

              {/* Completion burst */}
              <AnimatePresence>
                {justCompleted === task.id && !busy && (
                  <motion.span
                    initial={reduceMotion ? false : { scale: 0, opacity: 1 }}
                    animate={{ scale: 1.6, opacity: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                    className="absolute left-3.5 w-[26px] h-[26px] rounded-full bg-success-100 pointer-events-none"
                    aria-hidden="true"
                  />
                )}
              </AnimatePresence>

              {/* Chips — due date as pill, priority & status outlined */}
              <div className="flex items-center gap-2 shrink-0">
                {task.due_date && (
                  <span
                    className={cn(
                      'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-[11px] font-semibold tracking-wide',
                      isOverdue
                        ? 'bg-danger-600 text-white border-danger-600 shadow-subtle'
                        : 'bg-surface-muted text-ink-muted border-ink-border'
                    )}
                    title={isOverdue ? 'Overdue' : 'Due date'}
                  >
                    <Calendar className="w-3 h-3" aria-hidden="true" />
                    {isOverdue ? 'Overdue' : formatTaskDueDate(task.due_date)}
                  </span>
                )}

                <PriorityChip priority={task.priority} />
                <StatusChip status={task.status} done={done} />

                {/* Open task arrow — appears on hover */}
                <span
                  className="opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all duration-200 text-ink-subtle"
                  aria-hidden="true"
                >
                  <ArrowUpRight className="w-4 h-4" />
                </span>
              </div>
            </motion.li>
          );
        })}
      </AnimatePresence>
    </ul>
  );
};
