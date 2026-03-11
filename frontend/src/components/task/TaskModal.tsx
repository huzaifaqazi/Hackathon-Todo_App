import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar as CalendarIcon, Tag, AlertCircle } from 'lucide-react';
import { Task } from '../../types/task';

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

  // Initialize form data when task changes
  useEffect(() => {
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

  const handlePriorityChange = (priority: 'low' | 'medium' | 'high') => {
    setFormData(prev => ({ ...prev, priority }));
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

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          onClick={handleOverlayClick}
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-[600px] max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-8 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">
                {task ? 'Edit Task' : 'Add New Task'}
              </h2>
              <button
                onClick={handleClose}
                disabled={loading}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              {/* Task Title */}
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                  Task Title <span className="text-red-500">*</span>
                </label>
                <input
                  id="title"
                  name="title"
                  type="text"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Enter task title..."
                  className={`w-full text-lg px-0 py-3 border-0 border-b-2 ${
                    errors.title ? 'border-red-500' : 'border-gray-300'
                  } focus:border-blue-500 focus:outline-none focus:ring-0 transition-colors placeholder-gray-400`}
                />
                {errors.title && (
                  <div className="flex items-center gap-1 mt-2 text-red-500 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    {errors.title}
                  </div>
                )}
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Add description (optional)..."
                  rows={4}
                  className="w-full px-0 py-3 border-0 border-b-2 border-gray-300 focus:border-blue-500 focus:outline-none focus:ring-0 transition-colors placeholder-gray-400 resize-none"
                />
              </div>

              {/* Priority Selector */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Priority
                </label>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => handlePriorityChange('high')}
                    className={`flex-1 px-6 py-3 rounded-full font-medium transition-all ${
                      formData.priority === 'high'
                        ? 'bg-red-500 text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    High
                  </button>
                  <button
                    type="button"
                    onClick={() => handlePriorityChange('medium')}
                    className={`flex-1 px-6 py-3 rounded-full font-medium transition-all ${
                      formData.priority === 'medium'
                        ? 'bg-orange-500 text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Medium
                  </button>
                  <button
                    type="button"
                    onClick={() => handlePriorityChange('low')}
                    className={`flex-1 px-6 py-3 rounded-full font-medium transition-all ${
                      formData.priority === 'low'
                        ? 'bg-green-500 text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Low
                  </button>
                </div>
              </div>

              {/* Status Dropdown */}
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <div className="relative">
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white cursor-pointer"
                  >
                    <option value="pending">⚪ Pending</option>
                    <option value="in-progress">🔵 In Progress</option>
                    <option value="completed">🟢 Completed</option>
                  </select>
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Due Date */}
              <div>
                <label htmlFor="due_date" className="block text-sm font-medium text-gray-700 mb-2">
                  Due Date
                </label>
                <div className="relative">
                  <input
                    id="due_date"
                    name="due_date"
                    type="date"
                    value={formData.due_date}
                    onChange={handleChange}
                    min={today}
                    className={`w-full px-4 py-3 border ${
                      errors.due_date ? 'border-red-500' : 'border-gray-300'
                    } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  />
                  <CalendarIcon className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                </div>
                {errors.due_date && (
                  <div className="flex items-center gap-1 mt-2 text-red-500 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    {errors.due_date}
                  </div>
                )}
                {formData.due_date && (
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, due_date: '' }))}
                    className="mt-2 text-sm text-gray-500 hover:text-gray-700"
                  >
                    Clear date
                  </button>
                )}
              </div>

              {/* Tags */}
              <div>
                <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-2">
                  Tags
                </label>
                <div className="flex gap-2 mb-3">
                  <div className="relative flex-1">
                    <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      id="tags"
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Add a tag..."
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleAddTag}
                    className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                  >
                    Add
                  </button>
                </div>
                {formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="hover:text-blue-900"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={loading}
                  className="px-6 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors font-medium disabled:opacity-50"
                >
                  Cancel
                </button>
                <motion.button
                  type="submit"
                  disabled={loading || !formData.title.trim()}
                  whileHover={{ scale: loading || !formData.title.trim() ? 1 : 1.02 }}
                  whileTap={{ scale: loading || !formData.title.trim() ? 1 : 0.98 }}
                  className={`px-8 py-3 rounded-lg font-medium transition-colors shadow-sm ${
                    loading || !formData.title.trim()
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-blue-500 text-white hover:bg-blue-600'
                  }`}
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Saving...
                    </div>
                  ) : (
                    'Save Task'
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
