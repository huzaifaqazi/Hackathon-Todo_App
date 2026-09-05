import React, { useState, useCallback } from 'react';
import ProtectedRoute from '../components/layout/ProtectedRoute';
import DashboardLayout from '../components/layout/DashboardLayout';
import TaskModal from '../components/task/TaskModal';
import { Task } from '../types/task';
import { taskApi } from '../services/api';
import Head from 'next/head';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import {
  Search,
  Plus,
  LayoutGrid,
  List as ListIcon,
  Trash2,
  Edit,
  Calendar,
  X,
  CheckCircle2,
  SlidersHorizontal,
  Bot,
} from 'lucide-react';
import {
  getPriorityBadgeClass,
  formatTaskDueDate,
} from '../lib/task-ui';
import { EmptyState } from '../components/ui/empty-state';
import { LoadingState } from '../components/ui/spinner';
import { Button } from '../components/ui/button';
import { AnimatedCheckbox } from '../components/ui/animated-checkbox';
import { SegmentedControl } from '../components/ui/segmented-control';

const TasksPage: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('date');
  const [selectedTasks, setSelectedTasks] = useState<Set<string>>(new Set());
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [busyTaskId, setBusyTaskId] = useState<string | null>(null);
  const reduceMotion = useReducedMotion();

  // Fetch tasks
  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      const response = await taskApi.getTasks();
      if (response && response.data && response.data.tasks) {
        setTasks(response.data.tasks || []);
      } else {
        setTasks([]);
      }
    } catch (err: any) {
      console.error('Error fetching tasks:', err);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Apply filters and sorting
  const applyFiltersAndSorting = useCallback(() => {
    let result = [...tasks];

    // Search filter
    if (searchTerm) {
      result = result.filter(
        (task) =>
          task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (task.description && task.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      result = result.filter((task) => task.status === statusFilter);
    }

    // Priority filter
    if (priorityFilter !== 'all') {
      result = result.filter((task) => task.priority === priorityFilter);
    }

    // Sorting
    result.sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'priority': {
          const priorityOrder = { high: 0, medium: 1, low: 2 };
          return priorityOrder[a.priority as keyof typeof priorityOrder] - priorityOrder[b.priority as keyof typeof priorityOrder];
        }
        case 'name':
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

    setFilteredTasks(result);
  }, [tasks, searchTerm, statusFilter, priorityFilter, sortBy]);

  // Fetch tasks on mount
  React.useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // Apply filters when dependencies change
  React.useEffect(() => {
    applyFiltersAndSorting();
  }, [applyFiltersAndSorting]);

  // Toggle task selection
  const toggleTaskSelection = (taskId: string) => {
    const newSelected = new Set(selectedTasks);
    if (newSelected.has(taskId)) {
      newSelected.delete(taskId);
    } else {
      newSelected.add(taskId);
    }
    setSelectedTasks(newSelected);
  };

  // Select all tasks
  const selectAllTasks = () => {
    if (selectedTasks.size === filteredTasks.length) {
      setSelectedTasks(new Set());
    } else {
      setSelectedTasks(new Set(filteredTasks.map((t) => t.id)));
    }
  };

  // Bulk delete
  const handleBulkDelete = async () => {
    if (!window.confirm(`Delete ${selectedTasks.size} tasks?`)) return;

    try {
      await Promise.all(Array.from(selectedTasks).map((id) => taskApi.deleteTask(id)));
      await fetchTasks();
      setSelectedTasks(new Set());
    } catch (err) {
      console.error('Error deleting tasks:', err);
    }
  };

  // Bulk mark complete
  const handleBulkComplete = async () => {
    try {
      await Promise.all(
        Array.from(selectedTasks).map((id) => {
          const task = tasks.find((t) => t.id === id);
          if (task) {
            return taskApi.updateTask(id, { ...task, status: 'completed' });
          }
          return Promise.resolve();
        })
      );
      await fetchTasks();
      setSelectedTasks(new Set());
    } catch (err) {
      console.error('Error updating tasks:', err);
    }
  };

  // Delete single task
  const handleDeleteTask = async (taskId: string) => {
    if (!window.confirm('Delete this task?')) return;

    try {
      setBusyTaskId(taskId);
      await taskApi.deleteTask(taskId);
      await fetchTasks();
    } catch (err) {
      console.error('Error deleting tasks:', err);
    } finally {
      setBusyTaskId(null);
    }
  };

  // Toggle task completion
  const handleToggleComplete = async (task: Task) => {
    try {
      setBusyTaskId(task.id);
      const newStatus = task.status === 'completed' ? 'pending' : 'completed';
      await taskApi.updateTask(task.id, { ...task, status: newStatus });
      await fetchTasks();
    } catch (err) {
      console.error('Error updating tasks:', err);
    } finally {
      setBusyTaskId(null);
    }
  };

  // Save task (create or update)
  const handleSaveTask = async (taskData: Partial<Task>) => {
    try {
      if (taskData.id) {
        await taskApi.updateTask(taskData.id, taskData);
      } else {
        await taskApi.createTask(taskData);
      }
      await fetchTasks();
      setShowTaskForm(false);
      setEditingTask(null);
    } catch (err) {
      console.error('Error saving task:', err);
      throw err;
    }
  };

  // Open modal for editing
  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setShowTaskForm(true);
  };

  // Close modal
  const handleCloseModal = () => {
    setShowTaskForm(false);
    setEditingTask(null);
  };

  const statusOptions = [
    { value: 'all', label: 'All', accent: 'neutral' as const, count: tasks.length },
    { value: 'pending', label: 'Pending', accent: 'warning' as const, count: tasks.filter(t => t.status === 'pending').length },
    { value: 'in-progress', label: 'In Progress', accent: 'primary' as const, count: tasks.filter(t => t.status === 'in-progress').length },
    { value: 'completed', label: 'Completed', accent: 'success' as const, count: tasks.filter(t => t.status === 'completed').length },
  ];

  const priorityOptions = [
    { value: 'all', label: 'All', accent: 'neutral' as const, count: tasks.length },
    { value: 'high', label: 'High', accent: 'danger' as const, count: tasks.filter(t => t.priority === 'high').length },
    { value: 'medium', label: 'Medium', accent: 'warning' as const, count: tasks.filter(t => t.priority === 'medium').length },
    { value: 'low', label: 'Low', accent: 'success' as const, count: tasks.filter(t => t.priority === 'low').length },
  ];

  const sortOptions = [
    { value: 'date', label: 'Date' },
    { value: 'priority', label: 'Priority' },
    { value: 'name', label: 'Name' },
  ];

  const fadeIn = (delay: number) => ({
    initial: reduceMotion ? false : { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.4, delay, ease: 'easeOut' as const },
  });

  /** Card surface classes by priority — tinted wash + border */
  const cardSurface = (task: Task) => {
    const done = task.status === 'completed';
    if (done) return 'border-ink-border/50 bg-surface-background/60';
    if (task.priority === 'high') return 'border-danger-100 bg-danger-50/30';
    if (task.priority === 'medium') return 'border-warning-100 bg-warning-50/25';
    return 'border-ink-border bg-white';
  };

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="min-h-screen p-6 lg:p-8 relative">
          {/* Page background depth — soft aurora wash */}
          <div className="fixed inset-0 pointer-events-none -z-10" aria-hidden="true">
            <div className="absolute inset-0 bg-surface-background" />
            <div className="absolute -top-40 right-0 w-[36rem] h-[36rem] bg-gradient-to-br from-primary-100/50 to-violet-100/50 rounded-full blur-3xl" />
          </div>

          <Head>
            <title>All Tasks — TodoApp</title>
          </Head>
          <div className="max-w-7xl mx-auto">
            {/* Top Bar */}
            <motion.div
              {...fadeIn(0)}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6"
            >
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-primary-600 mb-1">
                  Your workspace
                </p>
                <h1 className="font-display text-2xl md:text-3xl font-bold text-ink tracking-tight">
                  All Tasks
                </h1>
                <p className="text-ink-muted mt-1">
                  Manage and organize your tasks
                </p>
              </div>

              <div className="flex items-center gap-3">
                {/* View Toggle — segmented control with sliding indicator */}
                <div
                  className="flex items-center bg-white rounded-full border border-ink-border p-1 shadow-subtle"
                  role="group"
                  aria-label="View mode"
                >
                  <SegmentedControl
                    ariaLabel="View mode"
                    variant="bar"
                    value={viewMode}
                    onChange={(v) => setViewMode(v as 'list' | 'grid')}
                    options={[
                      { value: 'list', label: 'List', icon: <ListIcon className="w-4 h-4" /> },
                      { value: 'grid', label: 'Grid', icon: <LayoutGrid className="w-4 h-4" /> },
                    ]}
                  />
                </div>

                {/* Add Task Button — gradient pill with shine sweep */}
                <motion.button
                  onClick={() => setShowTaskForm(true)}
                  whileTap={reduceMotion ? undefined : { scale: 0.96 }}
                  whileHover={reduceMotion ? undefined : { y: -1 }}
                  className="btn-shine group relative inline-flex items-center gap-2 flex-1 sm:flex-none justify-center px-5 py-2.5 rounded-full bg-gradient-to-r from-primary-600 to-violet-600 text-white text-sm font-bold tracking-tight shadow-glow-primary hover:shadow-card active:scale-95 transition-all cursor-pointer select-none"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    <Plus className="w-5 h-5 transition-transform duration-300 group-hover:rotate-90" aria-hidden="true" />
                    Add Task
                  </span>
                </motion.button>
              </div>
            </motion.div>

            {/* Filter Bar — segmented chips */}
            <motion.div
              {...fadeIn(0.1)}
              className="bg-white rounded-card border border-ink-border/70 shadow-subtle p-5 mb-6"
            >
              <div className="flex flex-col gap-4">
                {/* Search Input — full width */}
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-5 h-5 text-ink-subtle pointer-events-none" aria-hidden="true" />
                  <input
                    type="text"
                    placeholder="Search tasks by title or description..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    aria-label="Search tasks"
                    className="w-full pl-11 pr-4 py-2.5 border border-ink-border rounded-full focus:outline-none focus:ring-2 focus:ring-primary-600/20 focus:border-primary-600 bg-surface-background placeholder:text-ink-subtle font-medium transition-colors"
                  />
                </div>

                {/* Filter rows — status, priority, sort as segmented chips */}
                <div className="flex flex-col lg:flex-row lg:items-center gap-4 lg:gap-6">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-ink-subtle shrink-0">
                      <SlidersHorizontal className="w-3.5 h-3.5" aria-hidden="true" />
                      Status
                    </span>
                    <SegmentedControl
                      ariaLabel="Filter by status"
                      variant="chip"
                      value={statusFilter}
                      onChange={setStatusFilter}
                      options={statusOptions}
                    />
                  </div>

                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="text-xs font-semibold uppercase tracking-wider text-ink-subtle shrink-0">
                      Priority
                    </span>
                    <SegmentedControl
                      ariaLabel="Filter by priority"
                      variant="chip"
                      value={priorityFilter}
                      onChange={setPriorityFilter}
                      options={priorityOptions}
                    />
                  </div>

                  <div className="flex items-center gap-3 flex-wrap lg:ml-auto">
                    <span className="text-xs font-semibold uppercase tracking-wider text-ink-subtle shrink-0">
                      Sort
                    </span>
                    <SegmentedControl
                      ariaLabel="Sort tasks"
                      variant="bar"
                      value={sortBy}
                      onChange={setSortBy}
                      options={sortOptions}
                    />
                  </div>
                </div>

                {/* Results count + select all */}
                <div className="flex items-center justify-between pt-2 border-t border-ink-border/60">
                  <p className="text-sm text-ink-muted">
                    Showing{' '}
                    <strong className="text-ink font-display font-bold tabular-nums">
                      {filteredTasks.length}
                    </strong>
                    {' '}of{' '}
                    <strong className="text-ink font-display font-bold tabular-nums">
                      {tasks.length}
                    </strong>{' '}
                    tasks
                  </p>
                  {filteredTasks.length > 0 && (
                    <button
                      onClick={selectAllTasks}
                      className="group inline-flex items-center gap-1.5 text-sm font-semibold text-primary-600 hover:text-primary-700 rounded-full px-3 py-1 hover:bg-primary-50 transition-all cursor-pointer"
                    >
                      {selectedTasks.size === filteredTasks.length ? (
                        <>
                          <X className="w-4 h-4" aria-hidden="true" />
                          Deselect All
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
                          Select All
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Task Display */}
            {loading ? (
              <LoadingState label="Loading tasks..." />
            ) : filteredTasks.length === 0 && tasks.length === 0 ? (
              /* Empty State — no tasks at all */
              <motion.div {...fadeIn(0.2)} className="bg-white rounded-card border border-ink-border/70 shadow-subtle">
                <EmptyState
                  icon={<CheckCircle2 className="w-8 h-8" />}
                  title="No tasks yet"
                  description="Create your first task to get started with organizing your work."
                  action={
                    <Button onClick={() => setShowTaskForm(true)}>
                      <Plus className="w-4 h-4" aria-hidden="true" />
                      Create your first task
                    </Button>
                  }
                />
              </motion.div>
            ) : filteredTasks.length === 0 ? (
              /* Empty State — filters matched nothing */
              <motion.div {...fadeIn(0.2)} className="bg-white rounded-card border border-ink-border/70 shadow-subtle">
                <EmptyState
                  icon={<Search className="w-8 h-8" />}
                  title="No matching tasks"
                  description="Try adjusting your search or filters to find what you're looking for."
                  action={
                    <Button
                      variant="outline-primary"
                      onClick={() => {
                        setSearchTerm('');
                        setStatusFilter('all');
                        setPriorityFilter('all');
                      }}
                    >
                      Clear filters
                    </Button>
                  }
                />
              </motion.div>
            ) : viewMode === 'list' ? (
              /* List View */
              <div className="space-y-3">
                <AnimatePresence initial={false}>
                  {filteredTasks.map((task, index) => {
                    const done = task.status === 'completed';
                    const busy = busyTaskId === task.id;
                    const isOverdue =
                      !done && task.due_date ? new Date(task.due_date) < new Date() : false;

                    return (
                      <motion.div
                        key={task.id}
                        layout
                        initial={reduceMotion ? false : { opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                        transition={{ duration: 0.3, delay: Math.min(index * 0.03, 0.3) }}
                        className={`group relative flex items-center gap-4 rounded-card border p-5 transition-all duration-200 hover:shadow-subtle hover:-translate-y-0.5 hover:border-primary-300 ${cardSurface(task)}`}
                      >
                        {/* Priority dot rail */}
                        <span
                          className={`absolute left-0 top-2.5 bottom-2.5 w-1 rounded-full ${
                            task.priority === 'high'
                              ? 'bg-danger-500'
                              : task.priority === 'medium'
                              ? 'bg-warning-500'
                              : 'bg-success-500'
                          }`}
                          aria-hidden="true"
                        />

                        {/* Selection checkbox — animated */}
                        <AnimatedCheckbox
                          checked={selectedTasks.has(task.id)}
                          onChange={() => toggleTaskSelection(task.id)}
                          label={`Select task "${task.title}"`}
                        />

                        {/* Task content */}
                        <div className="flex-1 min-w-0">
                          <h3
                            className={`font-display text-base font-bold tracking-tight truncate ${
                              done ? 'text-ink-subtle line-through decoration-2' : 'text-ink'
                            }`}
                          >
                            {task.title}
                          </h3>
                          <div className="flex items-center gap-2 mt-1 text-xs text-ink-subtle font-medium">
                            {task.description ? (
                              <span className="truncate max-w-[22rem] hidden sm:block">
                                {task.description}
                              </span>
                            ) : (
                              <span className="hidden sm:inline-flex items-center gap-1">
                                <Bot className="w-3.5 h-3.5" aria-hidden="true" />
                                No description
                              </span>
                            )}
                            {task.due_date && (
                              <>
                                <span className="hidden sm:inline text-ink-border" aria-hidden="true">·</span>
                                <span
                                  className={`inline-flex items-center gap-1 shrink-0 ${
                                    isOverdue ? 'text-danger-600 font-semibold' : ''
                                  }`}
                                >
                                  <Calendar className="w-3.5 h-3.5" aria-hidden="true" />
                                  {isOverdue ? 'Overdue' : `Due ${formatTaskDueDate(task.due_date)}`}
                                </span>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Priority chip */}
                        <span
                          className={`hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-[11px] font-semibold tracking-wide shrink-0 ${getPriorityBadgeClass(task.priority)}`}
                        >
                          {task.priority}
                        </span>

                        {/* Action buttons — slide in on hover (list view) */}
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={() => handleEditTask(task)}
                            className="p-2.5 text-ink-subtle hover:text-primary-600 hover:bg-primary-50 rounded-full transition-all duration-200 hover:scale-110 active:scale-90 cursor-pointer"
                            aria-label={`Edit task "${task.title}"`}
                            title="Edit"
                          >
                            <Edit className="w-5 h-5" aria-hidden="true" />
                          </button>
                          <button
                            onClick={() => handleToggleComplete(task)}
                            disabled={busy}
                            className="p-2.5 text-ink-subtle hover:text-success-600 hover:bg-success-50 rounded-full transition-all duration-200 hover:scale-110 active:scale-90 cursor-pointer disabled:opacity-50"
                            aria-label={`Mark task "${task.title}" as ${done ? 'pending' : 'completed'}`}
                            title={done ? 'Mark as pending' : 'Mark complete'}
                          >
                            <CheckCircle2 className="w-5 h-5" aria-hidden="true" />
                          </button>
                          <button
                            onClick={() => handleDeleteTask(task.id)}
                            disabled={busy}
                            className="p-2.5 text-ink-subtle hover:text-danger-600 hover:bg-danger-50 rounded-full transition-all duration-200 hover:scale-110 active:scale-90 cursor-pointer disabled:opacity-50"
                            aria-label={`Delete task "${task.title}"`}
                            title="Delete"
                          >
                            <Trash2 className="w-5 h-5" aria-hidden="true" />
                          </button>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            ) : (
              /* Grid View */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                <AnimatePresence initial={false}>
                  {filteredTasks.map((task, index) => {
                    const done = task.status === 'completed';
                    const busy = busyTaskId === task.id;
                    const isOverdue =
                      !done && task.due_date ? new Date(task.due_date) < new Date() : false;

                    return (
                      <motion.div
                        key={task.id}
                        layout
                        initial={reduceMotion ? false : { opacity: 0, scale: 0.96 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.96 }}
                        transition={{ duration: 0.3, delay: Math.min(index * 0.03, 0.3) }}
                        className={`group relative flex flex-col rounded-card border p-5 transition-all duration-200 hover:shadow-card hover:-translate-y-1 hover:border-primary-300 ${cardSurface(task)}`}
                      >
                        {/* Priority dot rail */}
                        <span
                          className={`absolute left-0 top-2.5 bottom-2.5 w-1 rounded-full ${
                            task.priority === 'high'
                              ? 'bg-danger-500'
                              : task.priority === 'medium'
                              ? 'bg-warning-500'
                              : 'bg-success-500'
                          }`}
                          aria-hidden="true"
                        />

                        {/* Top row: checkbox + status dot */}
                        <div className="flex items-center justify-between mb-3">
                          <AnimatedCheckbox
                            checked={selectedTasks.has(task.id)}
                            onChange={() => toggleTaskSelection(task.id)}
                            label={`Select task "${task.title}"`}
                          />
                          <span
                            className={`px-2.5 py-0.5 rounded-full border text-[11px] font-semibold tracking-wide ${getPriorityBadgeClass(task.priority)}`}
                          >
                            {task.priority}
                          </span>
                        </div>

                        <h3
                          className={`font-display text-base font-bold tracking-tight line-clamp-2 mb-2 ${
                            done ? 'text-ink-subtle line-through decoration-2' : 'text-ink'
                          }`}
                        >
                          {task.title}
                        </h3>

                        {task.description && (
                          <p className="text-ink-muted text-sm line-clamp-3 mb-3">
                            {task.description}
                          </p>
                        )}

                        {task.due_date && (
                          <div
                            className={`inline-flex items-center gap-1.5 text-xs font-medium ${
                              isOverdue ? 'text-danger-600 font-semibold' : 'text-ink-subtle'
                            }`}
                          >
                            <Calendar className="w-3.5 h-3.5" aria-hidden="true" />
                            {isOverdue ? 'Overdue' : `Due ${formatTaskDueDate(task.due_date)}`}
                          </div>
                        )}

                        {/* Action buttons — outline text buttons (grid view) */}
                        <div className="flex items-center gap-2 pt-4 border-t border-ink-border/60 mt-auto">
                          <button
                            onClick={() => handleEditTask(task)}
                            className="flex-1 px-3 py-2 text-sm font-semibold text-primary-600 hover:bg-primary-600 hover:text-white rounded-input transition-colors cursor-pointer"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleToggleComplete(task)}
                            disabled={busy}
                            className="flex-1 px-3 py-2 text-sm font-semibold text-success-600 hover:bg-success-600 hover:text-white rounded-input transition-colors cursor-pointer disabled:opacity-50"
                          >
                            {done ? 'Undo' : 'Complete'}
                          </button>
                          <button
                            onClick={() => handleDeleteTask(task.id)}
                            disabled={busy}
                            className="flex-1 px-3 py-2 text-sm font-semibold text-danger-600 hover:bg-danger-600 hover:text-white rounded-input transition-colors cursor-pointer disabled:opacity-50"
                          >
                            Delete
                          </button>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>

        {/* Bulk Actions Bar — gradient pill */}
        <AnimatePresence>
          {selectedTasks.size > 0 && (
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 400, damping: 32 }}
              className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-primary-700 via-primary-600 to-violet-600 text-white rounded-full shadow-overlay px-5 py-3 flex items-center gap-5 z-50 max-w-[calc(100vw-2rem)] border border-white/20"
              role="toolbar"
              aria-label="Bulk task actions"
            >
              <span className="font-display font-bold text-sm whitespace-nowrap tabular-nums">
                {selectedTasks.size} selected
              </span>
              <span className="w-px h-6 bg-white/25" aria-hidden="true" />
              <div className="flex items-center gap-2">
                <button
                  onClick={handleBulkComplete}
                  className="px-4 py-1.5 text-sm font-semibold bg-white/15 hover:bg-white/25 rounded-full transition-colors cursor-pointer"
                >
                  Mark Complete
                </button>
                <button
                  onClick={handleBulkDelete}
                  className="px-4 py-1.5 text-sm font-semibold bg-danger-600/90 hover:bg-danger-600 rounded-full transition-colors cursor-pointer"
                >
                  Delete
                </button>
                <button
                  onClick={() => setSelectedTasks(new Set())}
                  aria-label="Clear selection"
                  className="p-2 hover:bg-white/15 rounded-full transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" aria-hidden="true" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DashboardLayout>

      {/* Task Modal */}
      <TaskModal
        isOpen={showTaskForm}
        onClose={handleCloseModal}
        onSave={handleSaveTask}
        task={editingTask}
      />
    </ProtectedRoute>
  );
};

export default TasksPage;
