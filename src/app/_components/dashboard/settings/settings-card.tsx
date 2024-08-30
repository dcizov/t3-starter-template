import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/app/_components/ui/card";
import SettingsButton from "@/app/_components/dashboard/settings/settings-button";

type SettingsCardProps = {
  title: string;
  description: string;
  children: React.ReactNode;
  isLoading: boolean;
  buttonText: string;
  onSubmit: () => void;
};

export function SettingsCard({
  title,
  description,
  children,
  isLoading,
  buttonText,
  onSubmit,
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
      <CardFooter className="flex justify-end p-6">
        <SettingsButton
          isLoading={isLoading}
          buttonText={buttonText}
          onClick={onSubmit}
        />
      </CardFooter>
    </Card>
  );
}
