import React, { useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { X, Calendar as CalendarIcon, Tag, Plus, Check, Bot } from 'lucide-react';
import { Task } from '../../types/task';
import { cn } from '../../lib/utils';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: Partial<Task>) => Promise<void>;
  task?: Task | null;
}

interface FormData {
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in-progress' | 'completed';
  due_date: string;
  tags: string[];
}

interface FormErrors {
  title?: string;
  description?: string;
  due_date?: string;
}

const priorityOptions: {
  value: FormData['priority'];
  label: string;
  dot: string;
  active: string;
  idle: string;
}[] = [
  {
    value: 'low',
    label: 'Low',
    dot: 'bg-success-500',
    active: 'bg-success-600 border-success-600 text-white shadow-[0_4px_16px_rgba(22,163,74,0.3)]',
    idle: 'border-success-200 bg-success-50/50 text-success-700 hover:bg-success-50 hover:border-success-300',
  },
  {
    value: 'medium',
    label: 'Medium',
    dot: 'bg-warning-500',
    active: 'bg-warning-600 border-warning-600 text-white shadow-[0_4px_16px_rgba(217,119,6,0.3)]',
    idle: 'border-warning-200 bg-warning-50/50 text-warning-700 hover:bg-warning-50 hover:border-warning-300',
  },
  {
    value: 'high',
    label: 'High',
    dot: 'bg-danger-500',
    active: 'bg-danger-600 border-danger-600 text-white shadow-[0_4px_16px_rgba(220,38,38,0.3)]',
    idle: 'border-danger-200 bg-danger-50/50 text-danger-700 hover:bg-danger-50 hover:border-danger-300',
  },
];

const statusOptions: {
  value: FormData['status'];
  label: string;
  dot: string;
}[] = [
  { value: 'pending', label: 'Pending', dot: 'bg-warning-500' },
  { value: 'in-progress', label: 'In Progress', dot: 'bg-primary-500' },
  { value: 'completed', label: 'Completed', dot: 'bg-success-500' },
];

const TaskModal: React.FC<TaskModalProps> = ({ isOpen, onClose, onSave, task }) => {
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    priority: 'medium',
    status: 'pending',
    due_date: '',
    tags: []
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const reduceMotion = useReducedMotion();

  // Initialize form data when task changes
  React.useEffect(() => {
    if (task) {
      setFormData({
        title: task.title || '',
        description: task.description || '',
        priority: task.priority || 'medium',
        status: task.status || 'pending',
        due_date: task.due_date || '',
        tags: task.tags || []
      });
    } else {
      setFormData({
        title: '',
        description: '',
        priority: 'medium',
        status: 'pending',
        due_date: '',
        tags: []
      });
    }
    setErrors({});
  }, [task, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handlePriorityChange = (priority: FormData['priority']) => {
    setFormData(prev => ({ ...prev, priority }));
  };

  const handleStatusChange = (status: FormData['status']) => {
    setFormData(prev => ({ ...prev, status }));
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Task title is required';
    }

    if (formData.due_date) {
      const selectedDate = new Date(formData.due_date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate < today) {
        newErrors.due_date = 'Due date cannot be in the past';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const taskData: Partial<Task> = {
        ...formData,
        // Backend rejects empty-string due_date with 422 — send null instead
        due_date: formData.due_date ? formData.due_date : null,
        ...(task?.id && { id: task.id })
      };

      await onSave(taskData);
      onClose();
    } catch (err) {
      console.error('Error saving task:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  // Get today's date in YYYY-MM-DD format for min date
  const today = new Date().toISOString().split('T')[0];

  // Field label — eyebrow style
  const fieldLabel = 'block text-xs font-semibold uppercase tracking-wider text-ink-subtle mb-2';

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={handleOverlayClick}
          className="fixed inset-0 bg-ink/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label={task ? 'Edit task' : 'Add new task'}
        >
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.95, y: 16 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="bg-white rounded-modal shadow-overlay w-full max-w-[560px] max-h-[90vh] overflow-y-auto scrollbar-thin overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header — gradient band with drifting blob */}
            <div className="relative bg-gradient-to-r from-primary-600 via-primary-600 to-violet-600 px-8 py-6 overflow-hidden">
              <div
                className="absolute -top-16 -right-10 w-56 h-56 bg-violet-400/25 rounded-full blur-3xl pointer-events-none"
                aria-hidden="true"
              />
              <div className="relative z-10 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-primary-100 mb-1">
                    {task ? 'Editing' : 'New task'}
                  </p>
                  <h2 className="font-display text-xl font-bold text-white tracking-tight">
                    {task ? 'Edit Task' : 'Add New Task'}
                  </h2>
                </div>
                <button
                  onClick={handleClose}
                  disabled={loading}
                  aria-label="Close dialog"
                  className="p-2.5 text-white/70 hover:text-white hover:bg-white/15 rounded-full transition-colors disabled:opacity-50 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="px-8 py-6 space-y-6">
              {/* Task Title — floating feel with icon */}
              <div>
                <label htmlFor="title" className={fieldLabel}>
                  Task Title <span className="text-danger-500 normal-case tracking-normal" aria-hidden="true">*</span>
                </label>
                <div className="relative">
                  <input
                    id="title"
                    name="title"
                    type="text"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="e.g. Review project proposal"
                    autoComplete="off"
                    className={cn(
                      'w-full px-4 py-3 border rounded-input font-display text-base font-semibold tracking-tight text-ink',
                      'focus:outline-none focus:ring-2 transition-all duration-200',
                      'placeholder:font-sans placeholder:text-[15px] placeholder:font-normal placeholder:text-ink-subtle/50',
                      errors.title
                        ? 'border-danger-600 focus:ring-danger-600/20'
                        : 'border-ink-border hover:border-ink-subtle focus:border-primary-600 focus:ring-primary-600/20 focus:shadow-glow-primary'
                    )}
                  />
                  {/* Char count for typing feedback */}
                  {formData.title.length > 0 && !errors.title && (
                    <motion.span
                      initial={reduceMotion ? false : { opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-success-600"
                      aria-hidden="true"
                    >
                      <Check className="w-4 h-4" />
                    </motion.span>
                  )}
                </div>
                {errors.title && (
                  <p className="mt-2 text-sm text-danger-600 font-medium" role="alert">
                    {errors.title}
                  </p>
                )}
              </div>

              {/* Description — textarea with subtle hint */}
              <div>
                <label htmlFor="description" className={fieldLabel}>
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Add details, links, or context (optional)..."
                  rows={3}
                  className="w-full px-4 py-3 border border-ink-border rounded-input text-[15px] text-ink leading-relaxed focus:outline-none focus:ring-2 focus:border-primary-600 focus:ring-primary-600/20 focus:shadow-glow-primary hover:border-ink-subtle transition-all placeholder:text-ink-subtle/50 resize-none"
                />
                <p className="mt-1.5 text-xs text-ink-subtle/80 flex items-center gap-1">
                  <Bot className="w-3.5 h-3.5" aria-hidden="true" />
                  Tip: the AI assistant can fill this in for you later
                </p>
              </div>

              {/* Priority — semantic chip selector */}
              <fieldset>
                <legend className={fieldLabel}>Priority</legend>
                <div className="flex gap-2.5" role="radiogroup" aria-label="Task priority">
                  {priorityOptions.map((option) => {
                    const active = formData.priority === option.value;
                    return (
                      <motion.button
                        key={option.value}
                        type="button"
                        role="radio"
                        aria-checked={active}
                        onClick={() => handlePriorityChange(option.value)}
                        whileTap={reduceMotion ? undefined : { scale: 0.94 }}
                        animate={active && !reduceMotion ? { scale: [1, 1.04, 1] } : { scale: 1 }}
                        transition={active ? { duration: 0.3 } : { duration: 0.15 }}
                        className={cn(
                          'flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-full border',
                          'text-sm font-semibold tracking-tight cursor-pointer transition-colors duration-200 select-none',
                          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600/40',
                          active ? option.active : option.idle
                        )}
                      >
                        <span
                          className={cn('w-1.5 h-1.5 rounded-full', active ? 'bg-white' : option.dot)}
                          aria-hidden="true"
                        />
                        {option.label}
                      </motion.button>
                    );
                  })}
                </div>
              </fieldset>

              {/* Status — pill selector with dots */}
              <fieldset>
                <legend className={fieldLabel}>Status</legend>
                <div
                  className="inline-flex bg-surface-muted/70 rounded-full p-1 gap-1"
                  role="radiogroup"
                  aria-label="Task status"
                >
                  {statusOptions.map((option) => {
                    const active = formData.status === option.value;
                    return (
                      <button
                        key={option.value}
                        type="button"
                        role="radio"
                        aria-checked={active}
                        onClick={() => handleStatusChange(option.value)}
                        className={cn(
                          'relative inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-semibold',
                          'transition-colors duration-200 cursor-pointer',
                          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600/40',
                          active ? 'text-white' : 'text-ink-muted hover:text-ink'
                        )}
                      >
                        {active && (
                          <motion.span
                            layoutId="task-status-active"
                            className="absolute inset-0 rounded-full bg-gradient-to-r from-primary-600 to-primary-500 shadow-glow-primary"
                            transition={
                              reduceMotion
                                ? { duration: 0 }
                                : { type: 'spring', stiffness: 400, damping: 32 }
                            }
                            aria-hidden="true"
                          />
                        )}
                        <span
                          className={cn('relative z-10 w-1.5 h-1.5 rounded-full', active ? 'bg-white' : option.dot)}
                          aria-hidden="true"
                        />
                        <span className="relative z-10">{option.label}</span>
                      </button>
                    );
                  })}
                </div>
              </fieldset>

              {/* Due Date — rounded with calendar chip preview */}
              <div>
                <label htmlFor="due_date" className={fieldLabel}>
                  Due Date
                </label>
                <div className="flex items-center gap-3">
                  <div className="relative flex-1">
                    <input
                      id="due_date"
                      name="due_date"
                      type="date"
                      value={formData.due_date}
                      onChange={handleChange}
                      min={today}
                      className={cn(
                        'w-full px-4 py-3 border rounded-input font-display text-[15px] font-medium tracking-tight text-ink',
                        'focus:outline-none focus:ring-2 transition-all',
                        errors.due_date
                          ? 'border-danger-600 focus:ring-danger-600/20'
                          : 'border-ink-border hover:border-ink-subtle focus:border-primary-600 focus:ring-primary-600/20'
                      )}
                    />
                  </div>
                  {formData.due_date && (
                    <motion.button
                      type="button"
                      initial={reduceMotion ? false : { opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      onClick={() => setFormData(prev => ({ ...prev, due_date: '' }))}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-full border border-ink-border text-sm font-semibold text-ink-subtle hover:text-danger-600 hover:border-danger-200 hover:bg-danger-50 transition-colors cursor-pointer whitespace-nowrap"
                    >
                      <X className="w-4 h-4" aria-hidden="true" />
                      Clear
                    </motion.button>
                  )}
                </div>
                {errors.due_date && (
                  <p className="mt-2 text-sm text-danger-600 font-medium" role="alert">
                    {errors.due_date}
                  </p>
                )}
                {formData.due_date && !errors.due_date && (
                  <p className="mt-2 text-xs text-ink-subtle flex items-center gap-1.5">
                    <CalendarIcon className="w-3.5 h-3.5" aria-hidden="true" />
                    Due{' '}
                    {new Date(formData.due_date).toLocaleDateString('en-US', {
                      weekday: 'long',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                )}
              </div>

              {/* Tags — pill input with animated add/remove */}
              <div>
                <label htmlFor="tags" className={fieldLabel}>
                  Tags
                </label>
                <div className="flex gap-2 mb-3">
                  <div className="relative flex-1">
                    <Tag className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-ink-subtle pointer-events-none" aria-hidden="true" />
                    <input
                      id="tags"
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Add a tag and press Enter..."
                      className="w-full pl-10 pr-4 py-2.5 border border-ink-border rounded-full bg-surface-background text-[15px] font-medium text-ink focus:outline-none focus:ring-2 focus:border-primary-600 focus:ring-primary-600/20 focus:bg-white hover:border-ink-subtle transition-all placeholder:text-ink-subtle/50"
                    />
                  </div>
                  <motion.button
                    type="button"
                    onClick={handleAddTag}
                    whileTap={reduceMotion ? undefined : { scale: 0.92 }}
                    disabled={!tagInput.trim()}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-primary-600 text-white text-sm font-semibold shadow-glow-primary hover:bg-primary-700 active:scale-95 transition-all cursor-pointer disabled:opacity-40 disabled:shadow-none disabled:pointer-events-none"
                  >
                    <Plus className="w-4 h-4" aria-hidden="true" />
                    Add
                  </motion.button>
                </div>
                {formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    <AnimatePresence initial={false}>
                      {formData.tags.map((tag) => (
                        <motion.span
                          key={tag}
                          layout
                          initial={reduceMotion ? false : { opacity: 0, scale: 0.7 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.7 }}
                          transition={{ duration: 0.2 }}
                          className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary-50 border border-primary-100 text-primary-700 rounded-full text-sm font-semibold"
                        >
                          {tag}
                          <button
                            type="button"
                            onClick={() => handleRemoveTag(tag)}
                            aria-label={`Remove tag ${tag}`}
                            className="hover:text-danger-600 cursor-pointer transition-colors"
                          >
                            <X className="w-3.5 h-3.5" aria-hidden="true" />
                          </button>
                        </motion.span>
                      ))}
                    </AnimatePresence>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-5 border-t border-ink-border/60">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={loading}
                  className="px-5 py-2.5 rounded-full text-sm font-semibold text-ink-muted hover:text-ink hover:bg-surface-muted transition-colors cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
                <motion.button
                  type="submit"
                  disabled={loading || !formData.title.trim()}
                  whileTap={reduceMotion ? undefined : { scale: 0.96 }}
                  className={cn(
                    'btn-shine group relative inline-flex items-center gap-2 px-6 py-2.5 rounded-full',
                    'bg-gradient-to-r from-primary-600 to-violet-600 text-white text-sm font-bold tracking-tight',
                    'shadow-glow-primary hover:shadow-card active:scale-95 transition-all cursor-pointer select-none',
                    'disabled:opacity-50 disabled:pointer-events-none disabled:shadow-none'
                  )}
                >
                  {loading ? (
                    <>
                      <svg
                        className="animate-spin h-4 w-4"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Saving...
                    </>
                  ) : (
                    <>
                      {task ? 'Update Task' : 'Create Task'}
                      {!task && <Plus className="w-4 h-4 transition-transform duration-300 group-hover:rotate-90" aria-hidden="true" />}
                    </>
                  )}
                </motion.button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default TaskModal;
