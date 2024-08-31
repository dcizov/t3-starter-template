import React from "react";
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
  isCardDirty: boolean;
  onSubmit: () => void;
  onCancel: () => void;
};

export function SettingsCard({
  title,
  description,
  children,
  isLoading,
  isCardDirty,
  onSubmit,
  onCancel,
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
      <CardFooter className="flex justify-end space-x-4 p-6">
        <SettingsButton
          isLoading={isLoading}
          isFormDirty={isCardDirty}
          buttonType="cancel"
          onClick={onCancel}
        />
        <SettingsButton
          isLoading={isLoading}
          isFormDirty={isCardDirty}
          buttonType="save"
          onClick={onSubmit}
        />
      </CardFooter>
    </Card>
  );
}
