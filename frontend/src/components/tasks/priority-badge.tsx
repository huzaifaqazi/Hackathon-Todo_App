import { Badge } from "../ui/badge";

interface PriorityBadgeProps {
  priority: 'high' | 'medium' | 'low';
  className?: string;
}

const PriorityBadge = ({ priority, className }: PriorityBadgeProps) => {
  const variant = priority === 'high' ? 'high' : priority === 'medium' ? 'medium' : 'low';

  return (
    <Badge variant={variant} className={className}>
      {priority.charAt(0).toUpperCase() + priority.slice(1)}
    </Badge>
  );
};

export { PriorityBadge };