import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { Task } from '../types/task';
import { taskApi } from '../services/api';

// Define the shape of our task context
interface TaskContextType {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  fetchTasks: (params?: { status?: string; priority?: string; limit?: number; offset?: number }) => Promise<void>;
  createTask: (taskData: Partial<Task>) => Promise<void>;
  updateTask: (taskId: string, taskData: Partial<Task>) => Promise<void>;
  patchTask: (taskId: string, taskData: Partial<Task>) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
}

// Create the context
const TaskContext = createContext<TaskContextType | undefined>(undefined);

// Define action types for the reducer
type TaskAction =
  | { type: 'FETCH_TASKS_START' }
  | { type: 'FETCH_TASKS_SUCCESS'; payload: Task[] }
  | { type: 'FETCH_TASKS_ERROR'; payload: string }
  | { type: 'CREATE_TASK_SUCCESS'; payload: Task }
  | { type: 'UPDATE_TASK_SUCCESS'; payload: Task }
  | { type: 'DELETE_TASK_SUCCESS'; payload: string }
  | { type: 'TASK_ERROR'; payload: string };

// Reducer function
const taskReducer = (state: { tasks: Task[]; loading: boolean; error: string | null }, action: TaskAction) => {
  switch (action.type) {
    case 'FETCH_TASKS_START':
      return {
        ...state,
        loading: true,
        error: null
      };
    case 'FETCH_TASKS_SUCCESS':
      return {
        ...state,
        loading: false,
        tasks: action.payload,
        error: null
      };
    case 'FETCH_TASKS_ERROR':
      return {
        ...state,
        loading: false,
        error: action.payload
      };
    case 'CREATE_TASK_SUCCESS':
      return {
        ...state,
        loading: false,
        tasks: [...state.tasks, action.payload],
        error: null
      };
    case 'UPDATE_TASK_SUCCESS':
      return {
        ...state,
        loading: false,
        tasks: state.tasks.map(task =>
          task.id === action.payload.id ? action.payload : task
        ),
        error: null
      };
    case 'DELETE_TASK_SUCCESS':
      return {
        ...state,
        loading: false,
        tasks: state.tasks.filter(task => task.id !== action.payload),
        error: null
      };
    case 'TASK_ERROR':
      return {
        ...state,
        loading: false,
        error: action.payload
      };
    default:
      return state;
  }
};

// Create the provider component
interface TaskProviderProps {
  children: React.ReactNode;
}

export const TaskProvider: React.FC<TaskProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(taskReducer, {
    tasks: [],
    loading: false,
    error: null
  });

  const fetchTasks = async (params?: { status?: string; priority?: string; limit?: number; offset?: number }) => {
    try {
      dispatch({ type: 'FETCH_TASKS_START' });
      const response = await taskApi.getTasks(params);
      dispatch({ type: 'FETCH_TASKS_SUCCESS', payload: response.data.tasks });
    } catch (error: any) {
      dispatch({ type: 'FETCH_TASKS_ERROR', payload: error.message || 'Failed to fetch tasks' });
    }
  };

  const createTask = async (taskData: Partial<Task>) => {
    try {
      const response = await taskApi.createTask(taskData);
      dispatch({ type: 'CREATE_TASK_SUCCESS', payload: response.data.task });
    } catch (error: any) {
      dispatch({ type: 'TASK_ERROR', payload: error.message || 'Failed to create task' });
    }
  };

  const updateTask = async (taskId: string, taskData: Partial<Task>) => {
    try {
      // Optimistic update: update the task in the UI immediately
      dispatch({
        type: 'UPDATE_TASK_SUCCESS',
        payload: { ...state.tasks.find(t => t.id === taskId), ...taskData } as Task
      });

      const response = await taskApi.updateTask(taskId, taskData);
      dispatch({ type: 'UPDATE_TASK_SUCCESS', payload: response.data.task });
    } catch (error: any) {
      dispatch({ type: 'TASK_ERROR', payload: error.message || 'Failed to update task' });
      // Optionally revert the optimistic update if it failed
      fetchTasks(); // Refresh tasks from server
    }
  };

  // Add patchTask function for partial updates
  const patchTask = async (taskId: string, taskData: Partial<Task>) => {
    try {
      // Optimistic update: update the task in the UI immediately
      dispatch({
        type: 'UPDATE_TASK_SUCCESS',
        payload: { ...state.tasks.find(t => t.id === taskId), ...taskData } as Task
      });

      const response = await taskApi.patchTask(taskId, taskData);
      dispatch({ type: 'UPDATE_TASK_SUCCESS', payload: response.data.task });
    } catch (error: any) {
      dispatch({ type: 'TASK_ERROR', payload: error.message || 'Failed to update task' });
      // Optionally revert the optimistic update if it failed
      fetchTasks(); // Refresh tasks from server
    }
  };

  const deleteTask = async (taskId: string) => {
    try {
      await taskApi.deleteTask(taskId);
      dispatch({ type: 'DELETE_TASK_SUCCESS', payload: taskId });
    } catch (error: any) {
      dispatch({ type: 'TASK_ERROR', payload: error.message || 'Failed to delete task' });
    }
  };

  // Fetch tasks on initial load
  useEffect(() => {
    fetchTasks();
  }, []);

  const value = {
    tasks: state.tasks,
    loading: state.loading,
    error: state.error,
    fetchTasks,
    createTask,
    updateTask,
    patchTask,
    deleteTask
  };

  return (
    <TaskContext.Provider value={value}>
      {children}
    </TaskContext.Provider>
  );
};

// Custom hook to use the task context
export const useTaskContext = (): TaskContextType => {
  const context = useContext(TaskContext);

  if (!context) {
    throw new Error('useTaskContext must be used within a TaskProvider');
  }

  return context;
};