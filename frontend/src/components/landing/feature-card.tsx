import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

interface FeatureCardProps {
  title: string;
  description: string;
  icon: string;
}

const FeatureCard = ({ title, description, icon }: FeatureCardProps) => {
  return (
    <Card className="flex flex-col items-center text-center p-6">
      <div className="text-3xl mb-4">{icon}</div>
      <CardHeader className="p-0">
        <CardTitle className="text-xl">{title}</CardTitle>
      </CardHeader>
      <CardContent className="p-0 mt-2">
        <p className="text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
};

export { FeatureCard };