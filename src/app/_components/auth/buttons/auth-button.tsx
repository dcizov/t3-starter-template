import { Button } from "@/app/_components/ui/button";
import { LoaderCircle } from "lucide-react";

interface Props {
  isLoading: boolean;
  showTwoFactor?: boolean;
  typeSubmit: "signin" | "signup" | "reset" | "set-password";
}

export default function AuthButton({
  isLoading,
  showTwoFactor = false,
  typeSubmit,
}: Props) {
  const buttonLabel = showTwoFactor
    ? "Confirm"
    : typeSubmit === "signin"
      ? "Sign in"
      : typeSubmit === "signup"
        ? "Create account"
        : typeSubmit === "reset"
          ? "Send reset email"
          : typeSubmit === "set-password"
            ? "Reset password"
            : "Submit";

  return (
    <Button type="submit" className="w-full" disabled={isLoading}>
      {isLoading && (
        <span className="mr-2 animate-spin">
          <LoaderCircle size={16} />
        </span>
      )}
      {buttonLabel}
    </Button>
  );
}
