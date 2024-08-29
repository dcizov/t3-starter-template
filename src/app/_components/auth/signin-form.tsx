"use client";

import type { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useCallback, useState } from "react";
import { Input } from "@/app/_components/ui/input";
import {
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/app/_components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/app/_components/ui/form";
import { signIn } from "next-auth/react";
import AuthButton from "@/app/_components/auth/auth-button";
import SocialAuthButton from "@/app/_components/auth/social-auth-button";
import { Toaster } from "@/app/_components/ui/sonner";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { api } from "@/trpc/react";
import { loginSchema } from "@/schemas/auth";

type InputType = z.infer<typeof loginSchema>;

export default function SignInForm() {
  const [showTwoFactor, setShowTwoFactor] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const form = useForm<InputType>({
    defaultValues: {
      email: "",
      password: "",
    },
    resolver: zodResolver(loginSchema),
  });

  const { mutateAsync } = api.auth.login.useMutation({
    onSuccess: async (data) => {
      if (data.twoFactor) {
        setShowTwoFactor(true);
        toast.success("2FA code sent", {
          description: "Please check your email for the 2FA code.",
          duration: 5000,
        });
      } else {
        const response = await signIn("credentials", {
          redirect: false,
          email: form.getValues("email"),
          password: form.getValues("password"),
        });

        if (!response?.ok) {
          toast.error("Login failed", {
            description: response?.error ?? "Invalid credentials",
            duration: 5000,
          });
          return;
        }

        toast.success("Welcome back!", {
          description: "Redirecting you to your dashboard!",
          duration: 3000,
        });

        setTimeout(() => {
          router.push("/dashboard");
        }, 3000);
      }
    },
    onError: (error) => {
      const errorMessages: Record<string, string> = {
        NOT_FOUND: "User does not exist",
        UNAUTHORIZED:
          error.message === "Email not verified"
            ? "Please verify your email before logging in."
            : "Please check your email and password.",
        TOKEN_NOT_FOUND: "2FA token not found",
        INVALID_TOKEN: "Invalid 2FA code",
        TOKEN_EXPIRED: "2FA token has expired",
      };

      if (error.data?.zodError) {
        Object.entries(error.data.zodError.fieldErrors).forEach(
          ([field, messages]) => {
            form.setError(field as keyof InputType, {
              type: "server",
              message: messages?.join(", "),
            });
          },
        );
        return;
      }

      toast.error("Login failed", {
        description:
          errorMessages[error.data?.code ?? error.message] ??
          "An unexpected error occurred",
        duration: 5000,
      });
    },
  });

  const onSubmit = useCallback(
    async (data: InputType) => {
      setIsLoading(true);
      try {
        await mutateAsync({ ...data, code: data.code });
      } catch (error) {
        console.error("Login failed:", error);
      } finally {
        setIsLoading(false);
      }
    },
    [mutateAsync],
  );

  const renderFormField = useCallback(
    (
      name: keyof InputType,
      label: string,
      type: "text" | "email" | "password" = "text",
      placeholder?: string,
    ) => (
      <FormField
        control={form.control}
        name={name}
        render={({ field }) => (
          <FormItem>
            <FormLabel>{label}</FormLabel>
            <FormControl>
              <Input placeholder={placeholder} type={type} {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    ),
    [form.control],
  );

  return (
    <>
      <Toaster
        position="bottom-right"
        toastOptions={{
          classNames: {
            error: "bg-red-400",
            success: "bg-green-400",
            warning: "bg-yellow-400",
            info: "bg-blue-400",
          },
        }}
      />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="w-full max-w-[350px] space-y-6">
            <CardHeader className="space-y-1 text-center">
              <CardTitle className="text-2xl font-bold sm:text-3xl">
                Sign in to your account
              </CardTitle>
              <CardDescription className="text-sm text-muted-foreground sm:text-base">
                {showTwoFactor
                  ? "Enter the 2FA code below to confirm your login"
                  : "Enter your email below to login to your account"}
              </CardDescription>
            </CardHeader>
            <div className="space-y-4">
              {showTwoFactor ? (
                renderFormField("code", "2FA code", "text", "123456")
              ) : (
                <>
                  {renderFormField(
                    "email",
                    "Email",
                    "email",
                    "email@example.com",
                  )}
                  <div className="space-y-2">
                    {renderFormField(
                      "password",
                      "Password",
                      "password",
                      "Password",
                    )}
                    <div className="text-right">
                      <Link
                        href="/reset-password"
                        className="text-xs underline sm:text-sm"
                      >
                        Forgot your password?
                      </Link>
                    </div>
                  </div>
                </>
              )}
              <div className="space-y-4">
                <AuthButton
                  isLoading={isLoading}
                  showTwoFactor={showTwoFactor}
                  typeSubmit="signin"
                />
                <SocialAuthButton typeSubmit="signin" provider="google" />
                <SocialAuthButton typeSubmit="signin" provider="github" />
              </div>
            </div>
            <div className="text-center text-sm">
              Don&apos;t have an account?{" "}
              <Link href="/signup" className="underline">
                Sign up
              </Link>
            </div>
          </div>
        </form>
      </Form>
    </>
  );
}
