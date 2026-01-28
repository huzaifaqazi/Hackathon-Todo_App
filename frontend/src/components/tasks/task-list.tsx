import { Task } from "../../types/task"; // Adjust path as needed
import { TaskCard } from "./task-card";
import { EmptyState } from "./empty-state";

interface TaskListProps {
  tasks: Task[];
  onEdit?: (task: Task) => void;
  onDelete?: (taskId: string) => void;
  onComplete?: (taskId: string) => void;
  deletingId?: string | null;
  saving?: boolean;
}

const TaskList = ({
  tasks,
  onEdit,
  onDelete,
  onComplete,
  deletingId,
  saving
}: TaskListProps) => {
  if (tasks.length === 0) {
    return (
      <EmptyState
        title="No tasks yet"
        description="Get started by creating your first task!"
        actionText="Create Task"
        onAction={() => onEdit?.({} as Task)} // This will trigger the new task form
      />
    );
  }

  return (
    <div className="grid gap-4">
      {tasks.map((task) => (
        <TaskCard
          key={task.id}
          task={task}
          onEdit={onEdit}
          onDelete={onDelete}
          onComplete={onComplete}
          deletingId={deletingId}
          saving={saving}
        />
      ))}
    </div>
  );
};

export { TaskList };