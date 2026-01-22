import React from 'react';
import { Task } from '../../types/task';

interface TaskCardProps {
  task: Task;
  onEdit?: (task: Task) => void;
  onDelete?: (taskId: string) => void;
  onToggleComplete?: (taskId: string) => void;
  deletingId?: string | null;
  saving?: boolean;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onEdit, onDelete, onToggleComplete, deletingId, saving }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in-progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'pending':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white overflow-hidden shadow rounded-lg" role="article" aria-labelledby={`task-title-${task.id}`}>
      <div className="px-4 py-5 sm:p-6">
        <div className="flex justify-between items-start">
          <div className="flex-1 min-w-0">
            <h3 id={`task-title-${task.id}`} className="text-lg font-medium text-gray-900 truncate">
              {task.title}
            </h3>
            {task.description && (
              <p className="mt-1 text-sm text-gray-500 line-clamp-2" aria-label={`Description: ${task.description}`}>
                {task.description}
              </p>
            )}
            <div className="mt-2 flex items-center space-x-2" role="group" aria-label="Task status and priority">
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}
                aria-label={`Status: ${task.status}`}
              >
                {task.status}
              </span>
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}
                aria-label={`Priority: ${task.priority}`}
              >
                {task.priority}
              </span>
            </div>
            {task.due_date && (
              <div className="mt-2 text-sm text-gray-500" aria-label={`Due date: ${new Date(task.due_date).toLocaleDateString()}`}>
                Due: {new Date(task.due_date).toLocaleDateString()}
              </div>
            )}
          </div>
          <div className="ml-4 flex-shrink-0 flex space-x-2" role="group" aria-label="Task actions">
            {onToggleComplete && (
              <button
                onClick={() => onToggleComplete(task.id)}
                className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                aria-label={task.status === 'completed' ? `Mark task ${task.title} as incomplete` : `Mark task ${task.title} as complete`}
              >
                {task.status === 'completed' ? 'Undo' : 'Complete'}
              </button>
            )}
            {onEdit && (
              <button
                onClick={() => onEdit(task)}
                className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                aria-label={`Edit task ${task.title}`}
              >
                Edit
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(task.id)}
                className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                aria-label={`Delete task ${task.title}`}
                disabled={deletingId === task.id || saving}
              >
                {deletingId === task.id ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Deleting...
                  </>
                ) : 'Delete'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskCard;