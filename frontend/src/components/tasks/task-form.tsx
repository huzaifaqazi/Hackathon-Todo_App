import React, { useState } from 'react';
import { Button } from "../ui/button";
import { InputField } from "../ui/form/input-field";
import { TextareaField } from "../ui/form/textarea-field";
import { PrioritySelector } from "./priority-selector";
import { Task } from "../../../src/types/task";

interface TaskFormProps {
  task?: Task | null;
  onSave: (taskData: Partial<Task>) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const TaskForm: React.FC<TaskFormProps> = ({ task, onSave, onCancel, isLoading = false }) => {
  const [formData, setFormData] = useState<Partial<Task>>({
    title: task?.title || '',
    description: task?.description || '',
    priority: task?.priority || 'medium',
    due_date: task?.due_date || '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePriorityChange = (priority: 'high' | 'medium' | 'low') => {
    setFormData(prev => ({
      ...prev,
      priority
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <InputField
        label="Title"
        id="title"
        name="title"
        value={formData.title || ''}
        onChange={handleChange}
        required
      />

      <TextareaField
        label="Description"
        id="description"
        name="description"
        value={formData.description || ''}
        onChange={handleChange}
      />

      <PrioritySelector
        value={formData.priority as 'high' | 'medium' | 'low' || 'medium'}
        onChange={handlePriorityChange}
      />

      <InputField
        label="Due Date"
        id="due_date"
        name="due_date"
        type="date"
        value={formData.due_date || ''}
        onChange={handleChange}
      />

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" disabled={isLoading}>
          {isLoading ? 'Saving...' : (task?.id ? 'Update Task' : 'Create Task')}
        </Button>
      </div>
    </form>
  );
};

export { TaskForm };