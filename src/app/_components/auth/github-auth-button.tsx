import { useState } from "react";
import { signIn } from "next-auth/react";
import { Button } from "@/app/_components/ui/button";
import { LoaderCircle } from "lucide-react";
import { SiGithub } from "@icons-pack/react-simple-icons";
import { DEFAULT_LOGIN_REDIRECT } from "@/lib/routes";

interface Props {
  typeSubmit: "signin" | "signup";
}

export default function GithubAuthButton({ typeSubmit }: Props) {
  const [isLoading, setIsLoading] = useState(false);

  const handleGithubSignIn = async () => {
    setIsLoading(true);
    await signIn("github", { callbackUrl: DEFAULT_LOGIN_REDIRECT });
  };

  return (
    <Button
      variant="outline"
      type="button"
      disabled={isLoading}
      className="flex w-full items-center justify-center gap-2"
      onClick={handleGithubSignIn}
    >
      {isLoading ? (
        <span className="animate-spin">
          <LoaderCircle size={16} />
        </span>
      ) : (
        <SiGithub size={16} />
      )}{" "}
      {typeSubmit === "signup" ? "Sign Up with Github" : "Sign in with Github"}
    </Button>
  );
}
