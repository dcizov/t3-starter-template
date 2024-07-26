import { useState } from "react";
import { signIn } from "next-auth/react";
import { Button } from "@/app/_components/ui/button";
import { LoaderCircle } from "lucide-react";
import { SiGoogle } from "@icons-pack/react-simple-icons";

interface Props {
  typeSubmit: "signin" | "signup";
}

export default function GoogleSigninButton({ typeSubmit }: Props) {
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    await signIn("google", { callbackUrl: "/dashboard", redirect: true });
  };

  return (
    <Button
      variant="outline"
      type="button"
      disabled={isLoading}
      className="flex w-full items-center justify-center gap-2"
      onClick={handleGoogleSignIn}
    >
      {isLoading ? (
        <span className="animate-spin">
          <LoaderCircle size={16} />
        </span>
      ) : (
        <SiGoogle size={16} />
      )}{" "}
      {typeSubmit === "signup" ? "Sign Up with Google" : "Sign in with Google"}
    </Button>
  );
}
