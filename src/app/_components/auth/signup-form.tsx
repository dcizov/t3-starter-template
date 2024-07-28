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
import GoogleSigninButton from "@/app/_components/auth/google-auth-button";
import AuthSubmitButton from "@/app/_components/auth/auth-button";
import { Toaster } from "@/app/_components/ui/sonner";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { api } from "@/trpc/react";
import { registerSchema } from "@/common/validation/auth";
import { signIn } from "next-auth/react";

type InputType = z.infer<typeof registerSchema>;

export default function SignUpForm() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const form = useForm<InputType>({
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
    resolver: zodResolver(registerSchema),
  });

  const { mutateAsync } = api.auth.register.useMutation({
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

      setTimeout(() => {
        router.push("/dashboard");
      }, 500);
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
      console.error("Registration failed:", error);
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
                Create an account
              </CardTitle>
              <CardDescription className="text-sm text-muted-foreground sm:text-base">
                Enter your details below to create your account
              </CardDescription>
            </CardHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" type="text" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
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
                      <FormLabel>Password</FormLabel>
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
              <div className="space-y-2">
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm Password</FormLabel>
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
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <AuthSubmitButton isLoading={isLoading} typeSubmit="signup" />
              </div>
              <div className="space-y-2">
                <GoogleSigninButton typeSubmit="signup" />
              </div>
            </div>
            <div className="text-center text-sm">
              Already have an account?{" "}
              <Link href="/signin" className="underline">
                Sign in
              </Link>
            </div>
          </div>
        </form>
      </Form>
    </>
  );
}
