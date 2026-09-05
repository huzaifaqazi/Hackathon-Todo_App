/**
 * Shared task UI helpers — single source of truth for priority/status
 * styling and date formatting. Previously duplicated 3x across
 * dashboard.tsx, tasks.tsx, and TaskCard.tsx with inconsistent colors.
 */
import type { Task } from '../types/task';
import { formatDate as formatAbsoluteDate } from '../utils/dateUtils';

export type TaskPriority = Task['priority'];
export type TaskStatus = Task['status'];

/** Badge-style classes for priority chips (bg + text, soft style) */
export function getPriorityBadgeClass(priority: TaskPriority | string): string {
  switch (priority) {
    case 'high':
      return 'bg-danger-100 text-danger-700';
    case 'medium':
      return 'bg-warning-100 text-warning-700';
    case 'low':
      return 'bg-success-100 text-success-700';
    default:
      return 'bg-surface-muted text-ink-muted';
  }
}

/** Badge-style classes for status chips (bg + text, soft style) */
export function getStatusBadgeClass(status: TaskStatus | string): string {
  switch (status) {
    case 'pending':
      return 'bg-surface-muted text-ink-muted';
    case 'in-progress':
      return 'bg-primary-100 text-primary-700';
    case 'completed':
      return 'bg-success-100 text-success-700';
    default:
      return 'bg-surface-muted text-ink-muted';
  }
}

/** Left border accent for task cards in list view */
export function getPriorityBorderClass(priority: TaskPriority | string): string {
  switch (priority) {
    case 'high':
      return 'border-l-danger-600';
    case 'medium':
      return 'border-l-warning-600';
    case 'low':
      return 'border-l-success-600';
    default:
      return 'border-l-ink-border';
  }
}

/** Human label for a status value ("in-progress" → "In Progress") */
export function getStatusLabel(status: TaskStatus | string): string {
  switch (status) {
    case 'in-progress':
      return 'In Progress';
    default:
      return status.charAt(0).toUpperCase() + status.slice(1);
  }
}

/** Short due-date display ("Jan 5") with UTC normalization */
export function formatTaskDueDate(dateString: string): string {
  const normalized = normalizeTimestamp(dateString);
  const date = new Date(normalized);
  if (isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

/** Full due-date display ("Jan 5, 2026") with UTC normalization */
export function formatTaskDueDateFull(dateString: string): string {
  return formatAbsoluteDate(dateString);
}

/** Handle backend timestamps that may lack a timezone indicator (assume UTC) */
function normalizeTimestamp(timestamp: string): string {
  if (!timestamp.endsWith('Z') && !/[+-]\d{2}:\d{2}$/.test(timestamp)) {
    return timestamp + 'Z';
  }
  return timestamp;
}

/** Sort tasks so the most recently created come first */
export function sortTasksByRecent(tasks: Task[]): Task[] {
  return [...tasks].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
}
