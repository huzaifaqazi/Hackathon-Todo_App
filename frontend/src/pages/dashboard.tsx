import React, { useState, useCallback } from 'react';
import ProtectedRoute from '../components/layout/ProtectedRoute';
import DashboardLayout from '../components/layout/DashboardLayout';
import { Task } from '../types/task';
import { taskApi } from '../services/api';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  TrendingUp,
  Plus,
  MessageSquare,
  MoreVertical,
  Calendar
} from 'lucide-react';

const DashboardPage: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

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

  // Calculate stats
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const pendingTasks = tasks.filter(t => t.status === 'pending').length;
  const inProgressTasks = tasks.filter(t => t.status === 'in-progress').length;

  // Get recent tasks (last 5)
  const recentTasks = tasks.slice(0, 5);

  // Priority badge colors
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-700';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700';
      case 'low':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="min-h-screen bg-[#F9FAFB] p-6">
          <div className="max-w-7xl mx-auto">
            {/* Welcome Section */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Welcome back, {user?.first_name}! 👋
              </h1>
              <p className="text-gray-600">Here's what's happening with your tasks today.</p>
            </div>

            {/* Stats Cards Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {/* Total Tasks */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 text-sm font-medium mb-1">Total Tasks</p>
                    <p className="text-4xl font-bold">{totalTasks}</p>
                    <p className="text-purple-100 text-xs mt-2">+12% from last week</p>
                  </div>
                  <div className="bg-white/20 p-3 rounded-lg">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                </div>
              </motion.div>

              {/* Completed Tasks */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-sm font-medium mb-1">Completed Tasks</p>
                    <p className="text-4xl font-bold">{completedTasks}</p>
                    <p className="text-green-100 text-xs mt-2">+8% from last week</p>
                  </div>
                  <div className="bg-white/20 p-3 rounded-lg">
                    <TrendingUp className="w-8 h-8" />
                  </div>
                </div>
              </motion.div>

              {/* Pending Tasks */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg p-6 text-white"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-100 text-sm font-medium mb-1">Pending Tasks</p>
                    <p className="text-4xl font-bold">{pendingTasks}</p>
                    <p className="text-orange-100 text-xs mt-2">Needs attention</p>
                  </div>
                  <div className="bg-white/20 p-3 rounded-lg">
                    <AlertCircle className="w-8 h-8" />
                  </div>
                </div>
              </motion.div>

              {/* In Progress */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm font-medium mb-1">In Progress</p>
                    <p className="text-4xl font-bold">{inProgressTasks}</p>
                    <p className="text-blue-100 text-xs mt-2">Keep going!</p>
                  </div>
                  <div className="bg-white/20 p-3 rounded-lg">
                    <Clock className="w-8 h-8" />
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Quick Actions Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8"
            >
              {/* Add New Task Button */}
              <Link href="/tasks">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-8 text-white cursor-pointer hover:shadow-xl transition-shadow">
                  <div className="flex items-center gap-4">
                    <div className="bg-white/20 p-4 rounded-lg">
                      <Plus className="w-8 h-8" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold mb-1">Add New Task</h3>
                      <p className="text-blue-100">Create and organize your tasks</p>
                    </div>
                  </div>
                </div>
              </Link>

              {/* Start AI Chat Button */}
              <Link href="/chat">
                <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-8 text-white cursor-pointer hover:shadow-xl transition-shadow">
                  <div className="flex items-center gap-4">
                    <div className="bg-white/20 p-4 rounded-lg">
                      <MessageSquare className="w-8 h-8" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold mb-1">Start AI Chat</h3>
                      <p className="text-purple-100">Get help managing your tasks</p>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>

            {/* Recent Tasks Widget */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-white rounded-xl shadow-lg p-6 mb-8"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Recent Tasks</h2>
                <Link href="/tasks" className="text-blue-500 hover:text-blue-600 font-medium text-sm">
                  View All →
                </Link>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>
              ) : recentTasks.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500 mb-4">No tasks yet</p>
                  <Link href="/tasks">
                    <button className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                      Create your first task
                    </button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentTasks.map((task) => (
                    <div
                      key={task.id}
                      className="flex items-center gap-4 p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer"
                    >
                      {/* Checkbox */}
                      <input
                        type="checkbox"
                        checked={task.status === 'completed'}
                        onChange={() => {}}
                        className="w-5 h-5 text-blue-500 rounded border-gray-300 focus:ring-blue-500"
                      />

                      {/* Task Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 truncate">{task.title}</h3>
                        {task.description && (
                          <p className="text-sm text-gray-500 truncate">{task.description}</p>
                        )}
                      </div>

                      {/* Priority Badge */}
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(
                          task.priority
                        )}`}
                      >
                        {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                      </span>

                      {/* Due Date */}
                      {task.due_date && (
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                          <Calendar className="w-4 h-4" />
                          {formatDate(task.due_date)}
                        </div>
                      )}

                      {/* Menu */}
                      <button className="p-2 hover:bg-gray-100 rounded-lg">
                        <MoreVertical className="w-5 h-5 text-gray-400" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Productivity Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="bg-white rounded-xl shadow-lg p-6"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Productivity Overview</h2>
              <div className="flex items-end justify-between h-64 gap-4">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => {
                  const height = Math.random() * 100 + 50; // Random height for demo
                  return (
                    <div key={day} className="flex-1 flex flex-col items-center gap-2">
                      <div className="w-full bg-gradient-to-t from-blue-500 to-blue-400 rounded-t-lg transition-all hover:from-blue-600 hover:to-blue-500" style={{ height: `${height}%` }}></div>
                      <span className="text-sm text-gray-600 font-medium">{day}</span>
                    </div>
                  );
                })}
              </div>
              <p className="text-center text-sm text-gray-500 mt-4">Tasks completed in the last 7 days</p>
            </motion.div>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
};

export default DashboardPage;
