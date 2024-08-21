import { useState } from "react";
import { signIn } from "next-auth/react";
import { Button } from "@/app/_components/ui/button";
import { LoaderCircle } from "lucide-react";
import { SiGithub, SiGoogle } from "@icons-pack/react-simple-icons";
import { DEFAULT_LOGIN_REDIRECT } from "@/lib/routes";

interface Props {
  typeSubmit: "signin" | "signup";
  provider: "github" | "google";
}

const providerIcons = {
  github: SiGithub,
  google: SiGoogle,
};

const providerLabels = {
  github: "Github",
  google: "Google",
};

export default function SocialAuthButton({ typeSubmit, provider }: Props) {
  const [isLoading, setIsLoading] = useState(false);
  const Icon = providerIcons[provider];
  const label = providerLabels[provider];

  const handleSignIn = async () => {
    setIsLoading(true);
    await signIn(provider, { callbackUrl: DEFAULT_LOGIN_REDIRECT });
  };

  return (
    <Button
      variant="outline"
      type="button"
      disabled={isLoading}
      className="flex w-full items-center justify-center gap-2"
      onClick={handleSignIn}
    >
      {isLoading ? (
        <span className="animate-spin">
          <LoaderCircle size={16} />
        </span>
      ) : (
        <Icon size={16} />
      )}{" "}
      {typeSubmit === "signup"
        ? `Sign Up with ${label}`
        : `Sign in with ${label}`}
    </Button>
  );
}
