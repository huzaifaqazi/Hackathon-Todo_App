import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Label } from "../ui/label";

interface PrioritySelectorProps {
  value: 'high' | 'medium' | 'low';
  onChange: (value: 'high' | 'medium' | 'low') => void;
  className?: string;
}

const PrioritySelector = ({ value, onChange, className }: PrioritySelectorProps) => {
  return (
    <div className="grid w-full max-w-sm items-center gap-1.5">
      <Label htmlFor="priority">Priority</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger id="priority" className={className}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="high">High</SelectItem>
          <SelectItem value="medium">Medium</SelectItem>
          <SelectItem value="low">Low</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export { PrioritySelector };