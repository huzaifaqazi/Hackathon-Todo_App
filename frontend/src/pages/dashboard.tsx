import React, { useState, useCallback } from 'react';
import ProtectedRoute from '../components/layout/ProtectedRoute';
import DashboardLayout from '../components/layout/DashboardLayout';
import TaskForm from '../components/task/TaskForm';
import TaskList from '../components/task/TaskList';
import { Task } from '../types/task';
import { taskApi } from '../services/api';
import { useAuth } from '../context/AuthContext';

const DashboardPage: React.FC = () => {
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null); // Track which task is being deleted
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<Task | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'created_at' | 'due_date' | 'priority' | 'status'>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const { user, isAuthenticated } = useAuth();

  // Function to fetch tasks
  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null); // Clear previous errors
      const response = await taskApi.getTasks();

      // Check if response has the expected structure
      if (response && response.data && response.data.tasks) {
        setTasks(response.data.tasks || []);
      } else {
        setTasks([]);
        console.warn('Unexpected API response format:', response);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load tasks');
      console.error('Error fetching tasks:', err);
      setTasks([]); // Set empty tasks on error to avoid blocking the UI
    } finally {
      setLoading(false);
    }
  }, []);

  // Function to filter and sort tasks
  const applyFiltersAndSorting = useCallback(() => {
    let result = [...tasks];

    // Apply search filter
    if (searchTerm) {
      result = result.filter(task =>
        task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (task.description && task.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      result = result.filter(task => task.status === statusFilter);
    }

    // Apply priority filter
    if (priorityFilter !== 'all') {
      result = result.filter(task => task.priority === priorityFilter);
    }

    // Apply sorting
    result.sort((a, b) => {
      let aValue: any, bValue: any;

      switch (sortBy) {
        case 'created_at':
          aValue = new Date(a.created_at).getTime();
          bValue = new Date(b.created_at).getTime();
          break;
        case 'due_date':
          aValue = a.due_date ? new Date(a.due_date).getTime() : 0;
          bValue = b.due_date ? new Date(b.due_date).getTime() : 0;
          break;
        case 'priority':
          aValue = ['high', 'medium', 'low'].indexOf(a.priority);
          bValue = ['high', 'medium', 'low'].indexOf(b.priority);
          break;
        case 'status':
          aValue = ['pending', 'in-progress', 'completed'].indexOf(a.status);
          bValue = ['pending', 'in-progress', 'completed'].indexOf(b.status);
          break;
        default:
          aValue = a.created_at;
          bValue = b.created_at;
      }

      if (sortOrder === 'asc') {
        return aValue - bValue;
      } else {
        return bValue - aValue;
      }
    });

    setFilteredTasks(result);
  }, [tasks, searchTerm, statusFilter, priorityFilter, sortBy, sortOrder]);

  // Function to handle saving a new task
  const handleSaveTask = useCallback(async (taskData: Partial<Task>) => {
    setSaving(true);
    setError(null); // Clear previous errors

    try {
      if (taskData.id) {
        // Update existing task
        if (taskData.hasOwnProperty('title') || taskData.hasOwnProperty('description') ||
            taskData.hasOwnProperty('status') || taskData.hasOwnProperty('priority') ||
            taskData.hasOwnProperty('due_date')) {
          await taskApi.updateTask(taskData.id, taskData);
        }
      } else {
        // Create new task
        await taskApi.createTask(taskData);
      }

      // Refresh tasks
      await fetchTasks();
      setShowTaskForm(false);
      setFormData(null);
    } catch (err: any) {
      setError(err.message || 'Failed to save task');
      console.error('Error saving task:', err);
    } finally {
      setSaving(false);
    }
  }, [fetchTasks]);

  // Function to cancel form
  const handleCancelForm = useCallback(() => {
    setShowTaskForm(false);
  }, []);

  // Function to handle deleting a task
  const handleDeleteTask = useCallback(async (taskId: string) => {
    if (!window.confirm('Are you sure you want to delete this task?')) {
      return;
    }

    setDeleting(taskId);
    setError(null);

    try {
      await taskApi.deleteTask(taskId);
      await fetchTasks(); // Refresh tasks after deletion
    } catch (err: any) {
      setError(err.message || 'Failed to delete task');
      console.error('Error deleting task:', err);
    } finally {
      setDeleting(null);
    }
  }, [fetchTasks]);

  // Fetch tasks when component mounts and auth is ready
  React.useEffect(() => {
    if (isAuthenticated) {
      fetchTasks();
    }
  }, [isAuthenticated, fetchTasks]);

  // Apply filters and sorting when tasks or filter/sort parameters change
  React.useEffect(() => {
    applyFiltersAndSorting();
  }, [tasks, searchTerm, statusFilter, priorityFilter, sortBy, sortOrder]);

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold text-gray-900">Task Dashboard</h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-blue-500 rounded-md p-3">
                      <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Total Tasks</dt>
                        <dd className="flex items-baseline">
                          <div className="text-2xl font-semibold text-gray-900">{tasks.length}</div>
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-yellow-500 rounded-md p-3">
                      <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Pending Tasks</dt>
                        <dd className="flex items-baseline">
                          <div className="text-2xl font-semibold text-gray-900">{tasks.filter(t => t.status === 'pending').length}</div>
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
                      <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Completed Tasks</dt>
                        <dd className="flex items-baseline">
                          <div className="text-2xl font-semibold text-gray-900">{tasks.filter(t => t.status === 'completed').length}</div>
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8">
              {showTaskForm ? (
                <div className="mb-8 bg-white p-6 rounded-lg shadow">
                  <h2 className="text-lg font-medium text-gray-900 mb-4">Add New Task</h2>
                  <TaskForm task={formData || null} onSave={handleSaveTask} onCancel={handleCancelForm} />
                </div>
              ) : (
                <>
                  {/* Search and Filter Controls */}
                  <div className="mb-6 space-y-4">
                    <div className="flex flex-col md:flex-row gap-4">
                      {/* Search Input */}
                      <div className="flex-1">
                        <input
                          type="text"
                          placeholder="Search tasks..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>

                      {/* Status Filter */}
                      <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="all">All Statuses</option>
                        <option value="pending">Pending</option>
                        <option value="in-progress">In Progress</option>
                        <option value="completed">Completed</option>
                      </select>

                      {/* Priority Filter */}
                      <select
                        value={priorityFilter}
                        onChange={(e) => setPriorityFilter(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="all">All Priorities</option>
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>

                      {/* Sort By */}
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as any)}
                        className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="created_at">Sort by Created Date</option>
                        <option value="due_date">Sort by Due Date</option>
                        <option value="priority">Sort by Priority</option>
                        <option value="status">Sort by Status</option>
                      </select>

                      {/* Sort Order */}
                      <button
                        onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                        className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white"
                      >
                        {sortOrder === 'asc' ? '↑ Asc' : '↓ Desc'}
                      </button>
                    </div>

                    {/* Add Task Button */}
                    <div className="flex justify-between items-center">
                      <h2 className="text-lg font-medium text-gray-900">Your Tasks ({filteredTasks.length})</h2>
                      <button
                        onClick={() => setShowTaskForm(true)}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        Add New Task
                      </button>
                    </div>
                  </div>
                </>
              )}

              {loading ? (
                <div className="bg-white shadow overflow-hidden sm:rounded-md p-8 text-center">
                  Loading tasks...
                </div>
              ) : error ? (
                <div className="bg-white shadow overflow-hidden sm:rounded-md p-8 text-center text-red-500">
                  {error}
                </div>
              ) : filteredTasks.length === 0 ? (
                <div className="bg-white shadow overflow-hidden sm:rounded-md">
                  <ul className="divide-y divide-gray-200">
                    <li>
                      <div className="px-6 py-4">
                        <div className="flex items-center justify-between">
                          <div className="text-sm font-medium text-gray-900">No tasks found</div>
                          <div className="text-sm text-gray-500">Try changing your search or filter criteria</div>
                        </div>
                      </div>
                    </li>
                  </ul>
                </div>
              ) : (
                <TaskList
                  tasks={filteredTasks}
                  onEdit={(task) => {
                    setFormData(task);
                    setShowTaskForm(true);
                  }}
                  onDelete={handleDeleteTask}
                  onToggleComplete={async (taskId) => {
                    try {
                      const task = tasks.find(t => t.id === taskId);
                      if (task) {
                        const newStatus = task.status === 'completed' ? 'pending' : 'completed';
                        await taskApi.updateTask(taskId, { ...task, status: newStatus });
                        await fetchTasks(); // Refresh tasks after update
                      }
                    } catch (err: any) {
                      setError(err.message || 'Failed to update task');
                      console.error('Error updating task:', err);
                    }
                  }}
                  deletingId={deleting}
                  saving={saving}
                />
              )}
            </div>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
};

export default DashboardPage;