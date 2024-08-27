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
import { Toaster } from "@/app/_components/ui/sonner";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { api } from "@/trpc/react";
import { resetPasswordSchema } from "@/schemas/auth";
import AuthButton from "@/app/_components/auth/auth-button";

type InputType = z.infer<typeof resetPasswordSchema>;

export default function ResetPasswordForm() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const form = useForm<InputType>({
    defaultValues: {
      email: "",
    },
    resolver: zodResolver(resetPasswordSchema),
  });

  const { mutateAsync } = api.auth.resetPassword.useMutation({
    onSuccess: () => {
      toast.success("Reset email sent!", {
        description: "Please check your email to reset your password.",
        duration: 5000,
      });

      setTimeout(() => {
        router.push("/signin");
      }, 3000);
    },
    onError: (error) => {
      let errorMessage = "An unexpected error occurred";

      if (error.data?.code === "NOT_FOUND") {
        errorMessage = error.message;
      } else if (error.data?.code === "INTERNAL_SERVER_ERROR") {
        errorMessage = "Failed to send reset email";
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

      toast.error("Reset failed", {
        description: errorMessage,
        duration: 5000,
      });
    },
  });

  const onSubmit = async (data: InputType) => {
    setIsLoading(true);
    try {
      await mutateAsync(data);
    } catch (error) {
      console.error("Reset failed:", error);
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
                Forgot your password?
              </CardTitle>
              <CardDescription className="text-sm text-muted-foreground sm:text-base">
                Enter your email below to reset your password
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
              <div className="space-y-4">
                <div className="space-y-2">
                  <AuthButton isLoading={isLoading} typeSubmit="reset" />
                </div>
              </div>
            </div>
            <div className="text-center text-sm">
              <Link href="/signin" className="underline">
                Back to sign in
              </Link>
            </div>
          </div>
        </form>
      </Form>
    </>
  );
}
