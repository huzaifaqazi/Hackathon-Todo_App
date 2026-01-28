import React, { useState, useCallback } from 'react';
import ProtectedRoute from '../components/layout/ProtectedRoute';
import DashboardLayout from '../components/layout/DashboardLayout';
import TaskForm from '../components/task/TaskForm';
import { TaskList } from '../components/tasks/task-list';
import { TaskCard } from '../components/tasks/task-card';
import { Task } from '../types/task';
import { taskApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../components/ui/select';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Search, Plus, Calendar, TrendingUp, CheckCircle2 } from 'lucide-react';

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
        <div
          className="min-h-screen w-full"
          style={{
            background: 'linear-gradient(135deg, #f7eeee 0%, #e2ead4 100%)' // Light pink to light green gradient
          }}
        >
          {/* Content container */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Task Dashboard</h1>
            <p className="text-muted-foreground">Manage and track your tasks efficiently</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm font-medium">Total Tasks</p>
                    <p className="text-3xl font-bold">{tasks.length}</p>
                  </div>
                  <div className="bg-white/20 p-3 rounded-lg">
                    <CheckCircle2 className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-100 text-sm font-medium">Pending Tasks</p>
                    <p className="text-3xl font-bold">{tasks.filter(t => t.status === 'pending').length}</p>
                  </div>
                  <div className="bg-white/20 p-3 rounded-lg">
                    <Calendar className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-sm font-medium">Completed Tasks</p>
                    <p className="text-3xl font-bold">{tasks.filter(t => t.status === 'completed').length}</p>
                  </div>
                  <div className="bg-white/20 p-3 rounded-lg">
                    <TrendingUp className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Task Form */}
          {showTaskForm && (
            <div className="mb-8">
              <Card>
                <CardHeader>
                  <CardTitle>Add New Task</CardTitle>
                </CardHeader>
                <CardContent>
                  <TaskForm task={formData || null} onSave={handleSaveTask} onCancel={handleCancelForm} />
                </CardContent>
              </Card>
            </div>
          )}

          {/* Search and Filters */}
          <Card className="mb-8 bg-white">
            <CardContent className="p-8">
              <div className="grid grid-cols-1 lg:grid-cols-6 gap-6">
                <div className="lg:col-span-2">
                  <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
                    Search Tasks
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="search"
                      placeholder="Search tasks by title or description..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 py-3 text-base bg-white border border-gray-400 rounded-lg"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="status-select" className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger id="status-select" className="py-3 text-base cursor-pointer hover:cursor-pointer">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all" className="cursor-pointer">All Statuses</SelectItem>
                      <SelectItem value="pending" className="cursor-pointer">Pending</SelectItem>
                      <SelectItem value="in-progress" className="cursor-pointer">In Progress</SelectItem>
                      <SelectItem value="completed" className="cursor-pointer">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label htmlFor="priority-select" className="block text-sm font-medium text-gray-700 mb-2">
                    Priority
                  </label>
                  <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                    <SelectTrigger id="priority-select" className="py-3 text-base cursor-pointer hover:cursor-pointer">
                      <SelectValue placeholder="Priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all" className="cursor-pointer">All Priorities</SelectItem>
                      <SelectItem value="low" className="cursor-pointer">Low</SelectItem>
                      <SelectItem value="medium" className="cursor-pointer">Medium</SelectItem>
                      <SelectItem value="high" className="cursor-pointer">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label htmlFor="sort-select" className="block text-sm font-medium text-gray-700 mb-2">
                    Sort By
                  </label>
                  <Select value={sortBy} onValueChange={(value) => setSortBy(value as any)}>
                    <SelectTrigger id="sort-select" className="py-3 text-base cursor-pointer hover:cursor-pointer">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="created_at" className="cursor-pointer">Created Date</SelectItem>
                      <SelectItem value="due_date" className="cursor-pointer">Due Date</SelectItem>
                      <SelectItem value="priority" className="cursor-pointer">Priority</SelectItem>
                      <SelectItem value="status" className="cursor-pointer">Status</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Order
                  </label>
                  <Button
                    variant="outline-blue"
                    onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                    className="w-full py-3 text-base"
                  >
                    {sortOrder === 'asc' ? '↑ Ascending' : '↓ Descending'}
                  </Button>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mt-8 space-y-4 sm:space-y-0">
                <h2 className="text-xl font-bold text-gray-900">
                  Your Tasks <span className="text-gray-500 font-normal">({filteredTasks.length})</span>
                </h2>
                <Button
                  variant="primary"
                  onClick={() => setShowTaskForm(true)}
                  className="py-3 px-6 text-base font-semibold"
                >
                  <Plus className="mr-2 h-5 w-5" />
                  Add New Task
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Task List */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : error ? (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-red-500">{error}</p>
              </CardContent>
            </Card>
          ) : filteredTasks.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <div className="mx-auto h-12 w-12 text-gray-400">
                  <svg
                    className="h-full w-full"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    ></path>
                  </svg>
                </div>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No tasks</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Get started by creating a new task.
                </p>
                <div className="mt-6">
                  <Button variant="primary" onClick={() => setShowTaskForm(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Task
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              <TaskList
                tasks={filteredTasks}
                onEdit={(task) => {
                  setFormData(task);
                  setShowTaskForm(true);
                }}
                onDelete={handleDeleteTask}
                onComplete={async (taskId) => {
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
            </div>
          )}
        </div>

        {/* Closing divs for the interactive background */}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
};

export default DashboardPage;