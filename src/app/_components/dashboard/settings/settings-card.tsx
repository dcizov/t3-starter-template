import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/app/_components/ui/card";

type SettingsCardProps = {
  title: string;
  description: string;
  children: React.ReactNode;
};

export function SettingsCard({
  title,
  description,
  children,
}: SettingsCardProps) {
  return (
    <Card className="rounded-lg border">
      <CardHeader className="space-y-1 p-6">
        <CardTitle className="text-xl font-bold">{title}</CardTitle>
        <CardDescription className="text-sm text-muted-foreground">
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 p-6">{children}</CardContent>
    </Card>
  );
}
