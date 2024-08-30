import { Button } from "@/app/_components/ui/button";
import { LoaderCircle } from "lucide-react";
import React from "react";

interface SettingsButtonProps {
  isLoading: boolean;
  buttonText: string;
}

const SettingsButton: React.FC<SettingsButtonProps> = ({
  isLoading,
  buttonText,
}) => {
  return (
    <Button type="submit" className="w-full sm:w-auto" disabled={isLoading}>
      {isLoading && (
        <span className="mr-2 animate-spin">
          <LoaderCircle size={16} />
        </span>
      )}
      {buttonText}
    </Button>
  );
};

export default SettingsButton;
