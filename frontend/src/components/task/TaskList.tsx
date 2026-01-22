import React from 'react';
import { Task } from '../../types/task';
import TaskCard from './TaskCard';

interface TaskListProps {
  tasks: Task[];
  onEdit?: (task: Task) => void;
  onDelete?: (taskId: string) => void;
  onToggleComplete?: (taskId: string) => void;
  deletingId?: string | null;
  saving?: boolean;
}

const TaskList: React.FC<TaskListProps> = ({
  tasks,
  onEdit,
  onDelete,
  onToggleComplete,
  deletingId,
  saving
}) => {
  if (tasks.length === 0) {
    return (
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          <li>
            <div className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium text-gray-900">No tasks yet</div>
                <div className="text-sm text-gray-500">Add your first task!</div>
              </div>
            </div>
          </li>
        </ul>
      </div>
    );
  }

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-md">
      <ul className="divide-y divide-gray-200">
        {tasks.map((task) => (
          <li key={task.id}>
            <TaskCard
              task={task}
              onEdit={onEdit}
              onDelete={onDelete}
              onToggleComplete={onToggleComplete}
              deletingId={deletingId}
              saving={saving}
            />
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TaskList;