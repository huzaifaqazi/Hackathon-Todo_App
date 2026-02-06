import React from 'react';
import { Card, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import { Task } from "../../types/task"; // Assuming this is the correct path
import { Edit3, Trash2, Calendar, Flag, CircleCheckBig } from 'lucide-react';
import { formatDate } from "../../utils/dateUtils";

interface TaskCardProps {
  task: Task;
  onEdit?: (task: Task) => void;
  onDelete?: (taskId: string) => void;
  onComplete?: (taskId: string) => void;
  deletingId?: string | null;
  saving?: boolean;
}

const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onEdit,
  onDelete,
  onComplete,
  deletingId,
  saving
}) => {
  const isCompleted = task.status === 'completed';

  // Format due date if it exists
  const formattedDueDate = task.due_date ? formatDate(task.due_date) : null;
  const isOverdue = task.due_date && new Date(task.due_date) < new Date() && !isCompleted;

  return (
    <Card className={`${isCompleted ? 'bg-gray-50 border-green-200' : isOverdue ? 'border-red-200 bg-red-50' : ''} transition-all duration-200 hover:shadow-md border-l-4 ${isCompleted ? 'border-l-green-500' : isOverdue ? 'border-l-red-500' : 'border-l-blue-500'}`}>
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="pt-1">
            <Checkbox
              checked={isCompleted}
              onCheckedChange={() => onComplete?.(task.id)}
              aria-label={isCompleted ? `Mark task ${task.title} as incomplete` : `Mark task ${task.title} as complete`}
            />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h3 className={`text-lg font-medium ${isCompleted ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                  {task.title}
                </h3>

                {task.description && (
                  <p className={`mt-2 text-sm ${isCompleted ? 'text-muted-foreground line-clamp-2' : 'text-muted-foreground'}`}>
                    {task.description}
                  </p>
                )}

                <div className="mt-3 flex flex-wrap gap-2">
                  <Badge
                    variant={task.priority as any}
                    className={`${task.priority === 'high' ? 'bg-red-100 text-red-800 hover:bg-red-100' :
                                task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100' :
                                'bg-green-100 text-green-800 hover:bg-green-100'} ${
                                  isOverdue ? 'bg-red-100 text-red-800' : ''
                                }`}
                  >
                    <Flag className="mr-1 h-3 w-3" />
                    {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                  </Badge>

                  <Badge
                    variant={isCompleted ? 'secondary' : 'outline'}
                    className={isCompleted ? 'bg-green-100 text-green-800' : ''}
                  >
                    <CircleCheckBig className="mr-1 h-3 w-3" />
                    {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                  </Badge>

                  {formattedDueDate && (
                    <Badge variant="outline" className={isOverdue ? 'border-red-200 text-red-700' : ''}>
                      <Calendar className="mr-1 h-3 w-3" />
                      {formattedDueDate}
                      {isOverdue && <span className="ml-1">(Overdue)</span>}
                    </Badge>
                  )}
                </div>
              </div>

              <div className="flex gap-2 ml-auto">
                <Button
                  variant="outline-blue"
                  size="sm"
                  onClick={() => onEdit?.(task)}
                  aria-label={`Edit task ${task.title}`}
                >
                  <Edit3 className="h-4 w-4" />
                </Button>

                <Button
                  variant="outline-danger"
                  size="sm"
                  onClick={() => onDelete?.(task.id)}
                  aria-label={`Delete task ${task.title}`}
                  disabled={deletingId === task.id || saving}
                >
                  {deletingId === task.id ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export { TaskCard };