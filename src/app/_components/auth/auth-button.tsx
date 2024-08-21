import { Button } from "@/app/_components/ui/button";
import { LoaderCircle } from "lucide-react";

interface Props {
  isLoading: boolean;
  typeSubmit: "signin" | "signup";
}

export default function AuthButton({ isLoading, typeSubmit }: Props) {
  return (
    <Button type="submit" className="w-full" disabled={isLoading}>
      {isLoading && (
        <span className="mr-2 animate-spin">
          <LoaderCircle size={16} />
        </span>
      )}
      {typeSubmit === "signin" ? "Sign in" : "Create Account"}
    </Button>
  );
}
