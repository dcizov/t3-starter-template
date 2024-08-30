import { Button } from "@/app/_components/ui/button";
import { LoaderCircle } from "lucide-react";

interface SettingsButtonProps {
  isLoading: boolean;
  buttonText: string;
  onClick: () => void;
}

const SettingsButton: React.FC<SettingsButtonProps> = ({
  isLoading,
  buttonText,
  onClick,
}) => {
  return (
    <Button
      type="button"
      className="w-full sm:w-auto"
      disabled={isLoading}
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
