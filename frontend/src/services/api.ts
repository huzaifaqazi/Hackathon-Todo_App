import axios from 'axios';
import { Task } from '../types/task';

// Create an axios instance with base configuration
const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  timeout: 10000, // 10 seconds timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token to requests
apiClient.interceptors.request.use(
  (config) => {
    // Check if we're in the browser (not server-side)
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      const token = localStorage.getItem('access_token');

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      // If no token, let the request proceed without authorization
      // The backend will return 401 which will be handled by response interceptor
      // This avoids redirect loops during page initialization
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle common errors
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle specific error cases
    if (error.response?.status === 401) {
      // Token might be expired, remove invalid token
      localStorage.removeItem('access_token');
      // Redirect to login page
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

// Task-related API functions
export const taskApi = {
  // Get all tasks for the authenticated user
  getTasks: async (params?: {
    status?: string;
    priority?: string;
    limit?: number;
    offset?: number;
  }) => {
    const response = await apiClient.get('/api/v1/tasks/', { params });
    return response.data;
  },

  // Create a new task
  createTask: async (taskData: Partial<Task>) => {
    const response = await apiClient.post('/api/v1/tasks/', taskData);
    return response.data;
  },

  // Get a specific task by ID
  getTaskById: async (taskId: string) => {
    const response = await apiClient.get(`/api/v1/tasks/${taskId}`);
    return response.data;
  },

  // Update a task (full update)
  updateTask: async (taskId: string, taskData: Partial<Task>) => {
    const response = await apiClient.put(`/api/v1/tasks/${taskId}`, taskData);
    return response.data;
  },

  // Update a task (partial update)
  patchTask: async (taskId: string, taskData: Partial<Task>) => {
    const response = await apiClient.patch(`/api/v1/tasks/${taskId}`, taskData);
    return response.data;
  },

  // Delete a task
  deleteTask: async (taskId: string) => {
    const response = await apiClient.delete(`/api/v1/tasks/${taskId}`);
    return response.data;
  }
};

export default apiClient;