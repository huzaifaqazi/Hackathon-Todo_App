import React, { useState, useEffect } from 'react';
import { Task } from '../../types/task';

interface TaskFormProps {
  task?: Task | null;
  onSave: (task: Partial<Task>) => void;
  onCancel: () => void;
}

// Validation errors interface
interface ValidationError {
  title?: string;
  description?: string;
}

const TaskForm: React.FC<TaskFormProps> = ({ task, onSave, onCancel }) => {
  const [formData, setFormData] = useState<Partial<Task>>({
    title: '',
    description: '',
    status: 'pending',
    priority: 'medium',
    due_date: ''
  });
  const [errors, setErrors] = useState<ValidationError>({});

  useEffect(() => {
    if (task) {
      setFormData({
        id: task.id,
        title: task.title || '',
        description: task.description || '',
        status: task.status || 'pending',
        priority: task.priority || 'medium',
        due_date: task.due_date || ''
      });
    } else {
      setFormData({
        title: '',
        description: '',
        status: 'pending',
        priority: 'medium',
        due_date: ''
      });
    }
  }, [task]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Validation function
  const validateForm = (): boolean => {
    const newErrors: ValidationError = {};

    // Title validation
    if (!formData.title || formData.title.trim() === '') {
      newErrors.title = 'Title is required';
    } else if (formData.title.trim().length > 200) {
      newErrors.title = 'Title must not exceed 200 characters';
    }

    // Description validation
    if (formData.description && formData.description.length > 1000) {
      newErrors.description = 'Description must not exceed 1000 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      onSave(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 bg-white/80 p-8 rounded-xl border border-gray-300 backdrop-blur-sm">
      <div>
        <label htmlFor="title" className="block text-base font-semibold text-gray-800 mb-2">
          Task Title *
        </label>
        <p className="text-sm text-gray-500 mb-3">Give your task a clear and descriptive title</p>
        <div className="mt-1">
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Enter task title..."
            className={`shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-base border-gray-300 rounded-lg py-3 px-4 transition-all duration-200 ${errors.title ? 'border-red-500' : 'border-gray-300 focus:border-blue-500'}`}
          />
          {errors.title && <p className="mt-2 text-sm text-red-600 font-medium">{errors.title}</p>}
        </div>
      </div>

      <div>
        <label htmlFor="description" className="block text-base font-semibold text-gray-800 mb-2">
          Task Description
        </label>
        <p className="text-sm text-gray-500 mb-3">Provide detailed information about the task</p>
        <div className="mt-1">
          <textarea
            id="description"
            name="description"
            rows={4}
            value={formData.description || ''}
            onChange={handleChange}
            placeholder="Describe the task details..."
            className={`shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-base border-gray-300 rounded-lg py-3 px-4 transition-all duration-200 ${errors.description ? 'border-red-500' : 'border-gray-300 focus:border-blue-500'}`}
          />
          {errors.description && <p className="mt-2 text-sm text-red-600 font-medium">{errors.description}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-y-8 gap-x-6 sm:grid-cols-2">
        <div>
          <label htmlFor="status" className="block text-base font-semibold text-gray-800 mb-2">
            Status
          </label>
          <p className="text-sm text-gray-500 mb-3">Set the current status of the task</p>
          <div className="mt-1">
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-base border-gray-300 rounded-lg py-3 px-4 transition-all duration-200 cursor-pointer hover:cursor-pointer"
            >
              <option value="pending" className="cursor-pointer">Pending</option>
              <option value="in-progress" className="cursor-pointer">In Progress</option>
              <option value="completed" className="cursor-pointer">Completed</option>
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="priority" className="block text-base font-semibold text-gray-800 mb-2">
            Priority
          </label>
          <p className="text-sm text-gray-500 mb-3">Indicate the importance of the task</p>
          <div className="mt-1">
            <select
              id="priority"
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-base border-gray-300 rounded-lg py-3 px-4 transition-all duration-200 cursor-pointer hover:cursor-pointer"
            >
              <option value="low" className="cursor-pointer">Low</option>
              <option value="medium" className="cursor-pointer">Medium</option>
              <option value="high" className="cursor-pointer">High</option>
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="due_date" className="block text-base font-semibold text-gray-800 mb-2">
            Due Date
          </label>
          <p className="text-sm text-gray-500 mb-3">Set the deadline for the task</p>
          <div className="mt-1">
            <input
              type="date"
              id="due_date"
              name="due_date"
              value={formData.due_date}
              onChange={handleChange}
              className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-base border-gray-300 rounded-lg py-3 px-4 transition-all duration-200 cursor-pointer"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          {task ? 'Update Task' : 'Create Task'}
        </button>
      </div>
    </form>
  );
};

export default TaskForm;