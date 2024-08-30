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
import { toast } from "sonner";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "@/trpc/react";
import { setNewPasswordSchema } from "@/schemas/auth";
import AuthButton from "@/app/_components/auth/buttons/auth-button";

type InputType = z.infer<typeof setNewPasswordSchema>;

export default function SetNewPasswordForm() {
  const [isLoading, setIsLoading] = useState(false);
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const router = useRouter();

  const form = useForm<InputType>({
    defaultValues: {
      password: "",
      token: token ?? "",
    },
    resolver: zodResolver(setNewPasswordSchema),
  });

  const { mutateAsync } = api.auth.setNewPassword.useMutation({
    onSuccess: () => {
      toast.success("Password reset successful!", {
        description: "Your password has been reset successfully.",
        duration: 5000,
      });

      setTimeout(() => {
        router.push("/signin");
      }, 3000);
    },
    onError: (error) => {
      let errorMessage = "An unexpected error occurred";

      if (error.data?.code === "BAD_REQUEST") {
        errorMessage = error.message;
      } else if (error.data?.code === "NOT_FOUND") {
        errorMessage = "Email not found";
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

      toast.error("Password reset failed", {
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
      console.error("Password reset failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="w-full max-w-[350px] space-y-6">
            <CardHeader className="space-y-1 text-center">
              <CardTitle className="text-2xl font-bold sm:text-3xl">
                Set new password
              </CardTitle>
              <CardDescription className="text-sm text-muted-foreground sm:text-base">
                Enter a new password for your account
              </CardDescription>
            </CardHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>New password</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="********"
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
                  <AuthButton isLoading={isLoading} typeSubmit="set-password" />
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
