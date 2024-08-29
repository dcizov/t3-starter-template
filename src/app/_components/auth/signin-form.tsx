"use client";

import type { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useState } from "react";
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
import SocialAuthButton from "@/app/_components/auth/social-auth-button"; // Import the new SocialAuthButton component
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
      let errorMessage = "An unexpected error occurred";

      if (error.data?.code === "NOT_FOUND") {
        errorMessage = "User does not exist";
      } else if (error.data?.code === "UNAUTHORIZED") {
        errorMessage =
          error.message === "Email not verified"
            ? "Please verify your email before logging in."
            : "Please check your email and password.";
      } else if (error.message) {
        switch (error.message) {
          case "TOKEN_NOT_FOUND":
            errorMessage = "2FA token not found";
            break;
          case "INVALID_TOKEN":
            errorMessage = "Invalid 2FA code";
            break;
          case "TOKEN_EXPIRED":
            errorMessage = "2FA token has expired";
            break;
          default:
            errorMessage = "An unexpected error occurred";
        }
      } else if (error.data?.zodError) {
        for (const [field, messages] of Object.entries(
          error.data.zodError.fieldErrors,
        )) {
          form.setError(field as keyof InputType, {
            type: "server",
            message: messages?.join(", "),
          });
        }
        return;
      }

      toast.error("Login failed", {
        description: errorMessage,
        duration: 5000,
      });
    },
  });

  const onSubmit = async (data: InputType) => {
    setIsLoading(true);
    try {
      await mutateAsync({ ...data, code: data.code });
    } catch (error) {
      console.error("Login failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

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
              {showTwoFactor && (
                <CardDescription className="text-sm text-muted-foreground sm:text-base">
                  Enter the 2FA code below to confirm your login
                </CardDescription>
              )}
              {!showTwoFactor && (
                <CardDescription className="text-sm text-muted-foreground sm:text-base">
                  Enter your email below to login to your account
                </CardDescription>
              )}
            </CardHeader>
            <div className="space-y-4">
              {showTwoFactor && (
                <div className="space-y-2">
                  <FormField
                    control={form.control}
                    name="code"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>2FA code</FormLabel>
                        <FormControl>
                          <Input placeholder="123456" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}
              {!showTwoFactor && (
                <>
                  <div className="space-y-2">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="email@example.com"
                              type="email"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="space-y-2">
                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex items-center justify-between">
                            <FormLabel>Password</FormLabel>
                            <Link
                              href="/reset-password"
                              className="text-xs underline sm:text-sm"
                            >
                              Forgot your password?
                            </Link>
                          </div>
                          <FormControl>
                            <Input
                              placeholder="Password"
                              type="password"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </>
              )}
              <div className="space-y-4">
                <div className="space-y-2">
                  <AuthButton
                    isLoading={isLoading}
                    showTwoFactor={showTwoFactor}
                    typeSubmit="signin"
                  />
                </div>
                <div className="space-y-2">
                  <SocialAuthButton typeSubmit="signin" provider="google" />
                </div>
                <div className="space-y-2">
                  <SocialAuthButton typeSubmit="signin" provider="github" />
                </div>
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
