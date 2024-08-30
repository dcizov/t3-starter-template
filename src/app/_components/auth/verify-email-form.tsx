"use client";

import { useState, useEffect, useCallback } from "react";
import {
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/app/_components/ui/card";
import { LoaderCircle } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/trpc/react";
import { useRouter, useSearchParams } from "next/navigation";

export default function VerifyEmailForm() {
  const [isLoading, setIsLoading] = useState(true);
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const router = useRouter();

  const { mutateAsync } = api.auth.verifyEmail.useMutation({
    onSuccess: (data) => {
      console.log("Verification successful:", data);

      if (!data.success) {
        toast.error("Login failed", {
          description: "Something went wrong",
          duration: 5000,
        });
        return;
      }

      toast.success("Email verified successfully!", {
        description: "You can now sign in.",
        duration: 3000,
      });

      setTimeout(() => {
        router.push("/signin");
      }, 3000);
    },
    onError: (error) => {
      let errorMessage = "An unexpected error occurred";

      if (error.data?.code === "INTERNAL_SERVER_ERROR") {
        errorMessage = "The verification link is invalid or has expired.";
      }

      toast.error("Verification failed", {
        description: errorMessage,
        duration: 5000,
      });
    },
    onSettled: () => {
      setIsLoading(false);
    },
  });

  const onSubmit = useCallback(
    async (token: string | null) => {
      if (!token) {
        toast.error("Verification failed", {
          description: "No token provided.",
          duration: 5000,
        });
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        await mutateAsync({ token });
      } catch (error) {
        console.error("Email not verified", error);
      }
    },
    [mutateAsync],
  );

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        await onSubmit(token);
      } catch (error) {
        console.error("Error in email verification:", error);
      }
    };

    verifyEmail().catch((error) => {
      console.error("Unhandled error in verifyEmail:", error);
    });
  }, [onSubmit, token]);

  // TODO: add resend email logic after token expired
  return (
    <>
      <div className="w-full max-w-[350px] space-y-6 text-center">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold sm:text-3xl">
            Verify your email
          </CardTitle>
          <CardDescription className="text-sm text-muted-foreground sm:text-base">
            {isLoading
              ? "Verifying your email. Please wait..."
              : "Verification email sent. Please check your email and click on the link to verify your account."}
          </CardDescription>
        </CardHeader>
        {isLoading && (
          <div className="flex justify-center pt-4">
            <span className="animate-spin">
              <LoaderCircle size={24} />
            </span>
          </div>
        )}
      </div>
    </>
  );
}
