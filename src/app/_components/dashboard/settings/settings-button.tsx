import React from "react";
import { Button } from "@/app/_components/ui/button";
import { LoaderCircle } from "lucide-react";

interface SettingsButtonProps {
  isLoading: boolean;
  isFormDirty: boolean;
  buttonType: "save" | "cancel";
  onClick: () => void;
}

const SettingsButton: React.FC<SettingsButtonProps> = ({
  isLoading,
  isFormDirty,
  buttonType,
  onClick,
}) => {
  const buttonText = buttonType === "cancel" ? "Cancel" : "Save";

  return (
    <Button
      type="button"
      className="w-full sm:w-auto"
      disabled={!isFormDirty || isLoading}
      variant={buttonType === "cancel" ? "outline" : "default"}
      onClick={onClick}
    >
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
