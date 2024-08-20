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
import GoogleSigninButton from "@/app/_components/auth/google-auth-button";
import GithubAuthButton from "@/app/_components/auth/github-auth-button";
import AuthSubmitButton from "@/app/_components/auth/auth-button";
import { Toaster } from "@/app/_components/ui/sonner";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { api } from "@/trpc/react";
import { loginSchema } from "@/common/validation/auth";

type InputType = z.infer<typeof loginSchema>;

export default function SignInForm() {
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
    onSuccess: async () => {
      const response = await signIn("credentials", {
        redirect: false,
        email: form.getValues("email"),
        password: form.getValues("password"),
      });

      if (!response?.ok) {
        toast.error("Login failed", {
          description: response?.error ?? "Invalid credentials",
        });
        return;
      }

      toast.success("Welcome back!", {
        description: "Redirecting you to your dashboard!",
      });

      router.push("/dashboard");
    },
    onError: (error) => {
      if (error.data?.zodError) {
        for (const [field, messages] of Object.entries(
          error.data.zodError.fieldErrors,
        )) {
          form.setError(field as keyof InputType, {
            type: "server",
            message: messages?.join(", "),
          });
        }
      } else {
        toast.error("Something went wrong!", {
          description: error.message,
        });
      }
    },
  });

  const onSubmit = async (data: InputType) => {
    setIsLoading(true);
    try {
      await mutateAsync(data);
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
              <CardDescription className="text-sm text-muted-foreground sm:text-base">
                Enter your email below to login to your account
              </CardDescription>
            </CardHeader>
            <div className="space-y-4">
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
                          href="/forgot-password"
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
              <div className="space-y-4">
                <div className="space-y-2">
                  <AuthSubmitButton isLoading={isLoading} typeSubmit="signin" />
                </div>
                <div className="space-y-2">
                  <GoogleSigninButton typeSubmit="signin" />
                </div>
                <div className="space-y-2">
                  <GithubAuthButton typeSubmit="signin" />
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
