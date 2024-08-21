import { useState } from "react";
import { signIn } from "next-auth/react";
import { Button } from "@/app/_components/ui/button";
import { LoaderCircle } from "lucide-react";
import { SiGoogle } from "@icons-pack/react-simple-icons";
import { DEFAULT_LOGIN_REDIRECT } from "@/lib/routes";

interface Props {
  typeSubmit: "signin" | "signup";
}

export default function GoogleAuthButton({ typeSubmit }: Props) {
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    await signIn("google", {
      callbackUrl: DEFAULT_LOGIN_REDIRECT,
      redirect: true,
    });
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
