import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

interface EmptyStateProps {
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
}

const EmptyState = ({ title, description, actionText, onAction }: EmptyStateProps) => {
  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-xl">{title}</CardTitle>
      </CardHeader>
      <CardContent className="text-center pb-6">
        <p className="text-muted-foreground mb-4">{description}</p>
        {actionText && onAction && (
          <Button onClick={onAction}>{actionText}</Button>
        )}
      </CardContent>
    </Card>
  );
};

export { EmptyState };