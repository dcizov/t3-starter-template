"use client";

import type { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { Input } from "@/app/_components/ui/input";
import { Textarea } from "@/app/_components/ui/textarea";
import { Switch } from "@/app/_components/ui/switch";
import {
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Card,
} from "@/app/_components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/app/_components/ui/form";
import { Button } from "@/app/_components/ui/button";
import { Toaster } from "@/app/_components/ui/sonner";
import { toast } from "sonner";
import { api } from "@/trpc/react";
import { settingsSchema } from "@/schemas/settings";

type InputType = z.infer<typeof settingsSchema>;

export default function SettingsForm() {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<InputType>({
    defaultValues: {
      username: "",
      email: "",
      bio: "",
      two_factor: false,
    },
    resolver: zodResolver(settingsSchema),
  });

  const { mutateAsync } = api.user.update.useMutation({
    onSuccess: () => {
      toast.success("Settings Updated", {
        description: "Your settings have been successfully updated.",
        duration: 5000,
      });
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
        toast.error("Update failed", {
          description: error.message || "Something went wrong!",
          duration: 5000,
        });
      }
    },
  });

  const onSubmit = async (data: InputType) => {
    setIsLoading(true);
    try {
      //   await mutateAsync(data);
    } catch (error) {
      console.error("Settings update failed:", error);
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
      <Card className="mt-6 rounded-lg border-none">
        <CardContent className="p-6">
          <div className="flex min-h-[calc(100vh-56px-64px-20px-24px-56px-48px)] items-center justify-center">
            <div className="w-full max-w-full">
              <Form {...form}>
                {/* First Inner Card: General Settings */}
                <Card className="rounded-lg border">
                  <CardHeader className="space-y-1 p-6">
                    <CardTitle className="text-2xl font-bold">
                      Settings
                    </CardTitle>
                    <CardDescription className="text-sm text-muted-foreground">
                      Update your account settings
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-6">
                    <form onSubmit={form.handleSubmit(onSubmit)}>
                      <div className="space-y-6">
                        <div className="space-y-4">
                          <FormField
                            control={form.control}
                            name="username"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Username</FormLabel>
                                <FormControl>
                                  <Input placeholder="johndoe" {...field} />
                                </FormControl>
                                <FormDescription>
                                  This is your public display name.
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="john@example.com"
                                    {...field}
                                  />
                                </FormControl>
                                <FormDescription>
                                  We&apos;ll never share your email with anyone
                                  else.
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="bio"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Bio</FormLabel>
                                <FormControl>
                                  <Textarea
                                    placeholder="Tell us a little about yourself"
                                    className="resize-none"
                                    {...field}
                                  />
                                </FormControl>
                                <FormDescription>
                                  A brief description of yourself.
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    </form>
                  </CardContent>
                </Card>

                {/* Second Inner Card: 2FA Settings */}
                <Card className="mt-6 rounded-lg border">
                  <CardHeader className="space-y-1 p-6">
                    <CardTitle className="text-xl font-bold">
                      Two-Factor Authentication (2FA)
                    </CardTitle>
                    <CardDescription className="text-sm text-muted-foreground">
                      Add an extra layer of security to your account
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4 p-6">
                    {/* 2FA Enable/Disable Switch */}
                    <FormField
                      control={form.control}
                      name="two_factor"
                      render={({ field }) => (
                        <FormItem className="flex items-center justify-between">
                          <FormLabel>Enable 2FA</FormLabel>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="mt-6 w-full"
                >
                  {isLoading ? "Updating..." : "Update Settings"}
                </Button>
              </Form>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
