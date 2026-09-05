import React, { useState, useCallback } from 'react';
import ProtectedRoute from '../components/layout/ProtectedRoute';
import DashboardLayout from '../components/layout/DashboardLayout';
import { Task } from '../types/task';
import { taskApi } from '../services/api';
import Link from 'next/link';
import Head from 'next/head';
import { useAuth } from '../context/AuthContext';
import { motion, useReducedMotion } from 'framer-motion';
import CountUp from 'react-countup';
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  TrendingUp,
  Plus,
  MessageSquare,
} from 'lucide-react';
import { sortTasksByRecent } from '../lib/task-ui';
import { EmptyState } from '../components/ui/empty-state';
import { LoadingState } from '../components/ui/spinner';
import { Button } from '../components/ui/button';
import { StatCard } from '../components/ui/stat-card';
import { DashboardTaskList } from '../components/ui/dashboard-task-list';
import { WeeklyActivityChart } from '../components/ui/weekly-activity-chart';

const DashboardPage: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const reduceMotion = useReducedMotion();

  // Function to fetch tasks
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

  // Fetch tasks on mount
  React.useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // Toggle task completion from the dashboard list
  const handleToggleComplete = async (task: Task) => {
    const newStatus = task.status === 'completed' ? 'pending' : 'completed';
    await taskApi.updateTask(task.id, { ...task, status: newStatus });
    await fetchTasks();
  };

  // Calculate stats
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const pendingTasks = tasks.filter(t => t.status === 'pending').length;
  const inProgressTasks = tasks.filter(t => t.status === 'in-progress').length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Get recent tasks (most recently created, last 5)
  const recentTasks = sortTasksByRecent(tasks).slice(0, 5);

  // Real weekly activity: tasks completed in the last 7 days, per day
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - (6 - i));
    return d;
  });

  const completedByDay = last7Days.map(day => {
    const next = new Date(day);
    next.setDate(day.getDate() + 1);
    return tasks.filter(t => {
      if (t.status !== 'completed') return false;
      const updated = new Date(t.updated_at);
      return updated >= day && updated < next;
    }).length;
  });
  const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const chartData = last7Days.map((d, i) => ({
    day: dayLabels[d.getDay()],
    count: completedByDay[i],
  }));
  const weekTotal = completedByDay.reduce((a, b) => a + b, 0);

  // Sparkline for the "Completed" stat: completions over the last 7 days
  const completedSpark = completedByDay;

  // Today's greeting by time of day
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  const stats = [
    {
      label: 'Total tasks',
      value: totalTasks,
      hint: `${completionRate}% completed`,
      icon: CheckCircle2,
      iconClass: 'bg-violet-100 text-violet-600',
      wash: 'from-violet-50/80',
    },
    {
      label: 'Completed',
      value: completedTasks,
      hint: totalTasks > 0 ? `${completionRate}% of all tasks` : 'No tasks yet',
      icon: TrendingUp,
      iconClass: 'bg-emerald-100 text-emerald-600',
      wash: 'from-emerald-50/80',
      spark: completedSpark,
    },
    {
      label: 'Pending',
      value: pendingTasks,
      hint: pendingTasks > 0 ? 'Needs attention' : 'All caught up',
      icon: AlertCircle,
      iconClass: 'bg-orange-100 text-orange-600',
      wash: 'from-orange-50/80',
    },
    {
      label: 'In progress',
      value: inProgressTasks,
      hint: inProgressTasks > 0 ? 'Keep going' : 'Nothing in flight',
      icon: Clock,
      iconClass: 'bg-primary-100 text-primary-600',
      wash: 'from-primary-50/80',
    },
  ];

  const sectionReveal = (delay: number) => ({
    initial: reduceMotion ? false : { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.45, delay, ease: 'easeOut' as const },
  });

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="min-h-screen p-6 lg:p-8 relative">
          {/* Page background depth — soft aurora wash behind the content */}
          <div className="fixed inset-0 pointer-events-none -z-10" aria-hidden="true">
            <div className="absolute inset-0 bg-surface-background" />
            <div className="absolute -top-40 right-0 w-[36rem] h-[36rem] bg-gradient-to-br from-primary-100/50 to-violet-100/50 rounded-full blur-3xl" />
            <div className="absolute -bottom-48 -left-24 w-[32rem] h-[32rem] bg-gradient-to-tr from-violet-100/40 to-primary-100/40 rounded-full blur-3xl" />
          </div>
          <Head>
            <title>Dashboard — TodoApp</title>
          </Head>
          <div className="max-w-7xl mx-auto">
            {/* Welcome Section — hero banner with animated progress ring */}
            <motion.div
              {...sectionReveal(0)}
              className="mb-8 relative overflow-hidden rounded-card bg-gradient-to-r from-primary-600 via-primary-600 to-violet-600 shadow-card p-6 sm:p-8"
            >
              {/* Decorative drifting blobs + grid */}
              <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
                <motion.div
                  className="absolute -top-16 -right-10 w-64 h-64 bg-white/10 rounded-full blur-2xl"
                  animate={reduceMotion ? undefined : { x: [0, 24, 0], y: [0, 16, 0] }}
                  transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
                />
                <motion.div
                  className="absolute -bottom-20 left-1/3 w-72 h-72 bg-violet-400/20 rounded-full blur-3xl"
                  animate={reduceMotion ? undefined : { x: [0, -20, 0], y: [0, -12, 0] }}
                  transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
                />
              </div>

              <div className="relative z-10 flex flex-col sm:flex-row sm:items-center gap-6 justify-between">
                <div>
                  <h1 className="font-display text-2xl md:text-3xl font-bold text-white mb-1 tracking-tight">
                    {greeting}, {user?.first_name}
                  </h1>
                  <p className="text-primary-100">
                    Here's what's happening with your tasks today.
                  </p>

                  {/* Inline chips: today's pulse */}
                  <div className="flex flex-wrap gap-2 mt-4">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/15 px-3 py-1 text-xs font-semibold text-white">
                      <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
                      {completedTasks} completed
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/15 px-3 py-1 text-xs font-semibold text-white">
                      <Clock className="w-3.5 h-3.5" aria-hidden="true" />
                      {inProgressTasks} in progress
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/15 px-3 py-1 text-xs font-semibold text-white">
                      <AlertCircle className="w-3.5 h-3.5" aria-hidden="true" />
                      {pendingTasks} pending
                    </span>
                  </div>
                </div>

                {/* Animated completion-rate ring */}
                <div className="flex items-center gap-4 shrink-0">
                  <div className="relative w-24 h-24">
                    <svg viewBox="0 0 96 96" className="w-full h-full -rotate-90">
                      {/* Track — lighter step of the same hue */}
                      <circle cx="48" cy="48" r="40" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="8" />
                      <motion.circle
                        cx="48"
                        cy="48"
                        r="40"
                        fill="none"
                        stroke="#ffffff"
                        strokeWidth="8"
                        strokeLinecap="round"
                        strokeDasharray={2 * Math.PI * 40}
                        initial={reduceMotion ? false : { strokeDashoffset: 2 * Math.PI * 40 }}
                        animate={{ strokeDashoffset: 2 * Math.PI * 40 * (1 - completionRate / 100) }}
                        transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-2xl font-semibold text-white leading-none">
                        <CountUp end={completionRate} duration={reduceMotion ? 0 : 1} suffix="%" />
                      </span>
                      <span className="text-[10px] font-medium text-primary-100 mt-1 uppercase tracking-wide">
                        done
                      </span>
                    </div>
                  </div>
                  <div className="hidden lg:block text-white/80 text-sm leading-relaxed">
                    <p className="font-semibold text-white">
                      {completedTasks}/{totalTasks} tasks
                    </p>
                    <p>completed overall</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Stats Cards Row — redesigned tiles */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
              {stats.map((stat, index) => (
                <StatCard key={stat.label} index={index} {...stat} />
              ))}
            </div>

            {/* Quick Actions Section — outline tiles with tinted icons */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
              <motion.div {...sectionReveal(0.2)}>
                <Link href="/tasks">
                  <div className="group relative bg-white rounded-card border border-ink-border/70 shadow-subtle hover:shadow-card hover:border-primary-200 hover:-translate-y-1 p-6 cursor-pointer transition-all duration-200 overflow-hidden h-full">
                    <div
                      className="absolute inset-x-0 top-0 h-1 origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300 bg-gradient-to-r from-primary-500 to-primary-400"
                      aria-hidden="true"
                    />
                    <div className="flex items-center gap-4">
                      <div className="bg-primary-50 text-primary-600 p-3.5 rounded-input group-hover:scale-110 group-hover:-rotate-6 transition-transform duration-300">
                        <Plus className="w-6 h-6" aria-hidden="true" />
                      </div>
                      <div>
                        <h3 className="font-display text-lg font-bold text-ink">Add New Task</h3>
                        <p className="text-ink-muted text-sm mt-0.5">Create and organize your tasks</p>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>

              <motion.div {...sectionReveal(0.26)}>
                <Link href="/chat">
                  <div className="group relative bg-white rounded-card border border-ink-border/70 shadow-subtle hover:shadow-card hover:border-violet-200 hover:-translate-y-1 p-6 cursor-pointer transition-all duration-200 overflow-hidden h-full">
                    <div
                      className="absolute inset-x-0 top-0 h-1 origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300 bg-gradient-to-r from-violet-500 to-violet-400"
                      aria-hidden="true"
                    />
                    <div className="flex items-center gap-4">
                      <div className="bg-violet-50 text-violet-600 p-3.5 rounded-input group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300">
                        <MessageSquare className="w-6 h-6" aria-hidden="true" />
                      </div>
                      <div>
                        <h3 className="font-display text-lg font-bold text-ink">Start AI Chat</h3>
                        <p className="text-ink-muted text-sm mt-0.5">Get help managing your tasks</p>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            </div>

            {/* Recent Tasks Widget — redesigned list */}
            <motion.div
              {...sectionReveal(0.32)}
              className="bg-white rounded-card border border-ink-border/70 shadow-subtle p-6 mb-8"
            >
              <div className="flex items-center justify-between gap-4 mb-5 pb-4 border-b border-ink-border/60">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-primary-600 mb-1">
                    Your list
                  </p>
                  <h2 className="font-display text-xl font-bold text-ink tracking-tight">
                    Recent Tasks
                  </h2>
                </div>
                <div className="flex items-center gap-3">
                  {/* Counter chip — bold number + label, tabular for alignment */}
                  <span className="inline-flex items-center gap-2 rounded-full bg-primary-600 text-white px-3.5 py-1.5 text-xs shadow-glow-primary">
                    <span className="font-display font-bold text-sm tabular-nums leading-none">
                      {recentTasks.length}
                    </span>
                    <span className="font-semibold tracking-wide opacity-90">latest</span>
                  </span>
                  {/* View All — pill button with hover fill */}
                  <Link
                    href="/tasks"
                    className="group inline-flex items-center gap-1.5 rounded-full border border-primary-200 bg-white text-primary-700 px-4 py-1.5 text-sm font-bold tracking-tight hover:bg-primary-600 hover:text-white hover:border-primary-600 hover:shadow-card active:scale-95 transition-all cursor-pointer"
                  >
                    View All
                    <span className="font-bold transition-transform group-hover:translate-x-0.5" aria-hidden="true">→</span>
                  </Link>
                </div>
              </div>

              {loading ? (
                <LoadingState label="Loading tasks..." />
              ) : recentTasks.length === 0 ? (
                <EmptyState
                  icon={<CheckCircle2 className="w-8 h-8" />}
                  title="No tasks yet"
                  description="Create your first task to get started."
                  action={
                    <Link href="/tasks">
                      <Button>Create your first task</Button>
                    </Link>
                  }
                />
              ) : (
                <DashboardTaskList tasks={recentTasks} onToggle={handleToggleComplete} />
              )}
            </motion.div>

            {/* Weekly Activity Chart — Recharts, dataviz-spec, tinted panel */}
            <motion.div
              {...sectionReveal(0.38)}
              className="bg-gradient-to-br from-white to-primary-50/40 rounded-card border border-ink-border/70 shadow-subtle p-6"
            >
              <WeeklyActivityChart data={chartData} weekTotal={weekTotal} />
            </motion.div>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
};

export default DashboardPage;
