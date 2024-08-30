"use client";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/app/_components/ui/card";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { Input } from "@/app/_components/ui/input";
import { Textarea } from "@/app/_components/ui/textarea";
import { Switch } from "@/app/_components/ui/switch";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/app/_components/ui/form";
import { Toaster, toast } from "sonner";
import { api } from "@/trpc/react";
import { updateSettingsSchema } from "@/schemas/settings";
import { SettingsCard } from "@/app/_components/dashboard/settings/settings-card";
import { type Session } from "next-auth";
import type { z } from "zod";

interface SettingsFormProps {
  session: Session | null;
}

type InputType = z.infer<typeof updateSettingsSchema>;

export default function SettingsForm({ session }: SettingsFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const user = session?.user;

  const form = useForm<InputType>({
    defaultValues: {
      firstName: user?.firstName ?? "",
      lastName: user?.lastName ?? "",
      email: user?.email ?? "",
      bio: user?.bio ?? "",
      two_factor: user?.isTwoFactorEnabled ?? false,
    },
    resolver: zodResolver(updateSettingsSchema),
  });

  const { mutateAsync } = api.settings.updateSettings.useMutation({
    onSuccess: () => {
      toast.success("Settings Updated", {
        description: "Your settings have been successfully updated.",
        duration: 5000,
      });
    },
    onError: (error) => {
      toast.error("Update failed", {
        description: error.message || "Something went wrong!",
        duration: 5000,
      });
    },
  });

  const onSubmit = async (data: InputType) => {
    setIsLoading(true);
    try {
      await mutateAsync(data);
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
        <CardHeader className="space-y-1 p-6">
          <CardTitle className="text-2xl font-bold">Settings</CardTitle>
          <CardDescription className="text-sm text-muted-foreground">
            Update your account settings
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <div className="space-y-6">
                {/* General Settings Card */}
                <SettingsCard
                  title="General"
                  description="Update general settings"
                  isLoading={isLoading}
                  buttonText="Save Changes"
                >
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last Name</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
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
                          <Input placeholder="john@example.com" {...field} />
                        </FormControl>
                        <FormDescription>
                          We&apos;ll never share your email with anyone else.
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
                </SettingsCard>

                {/* Password Settings Card */}
                <SettingsCard
                  title="Password"
                  description="Update your password"
                  isLoading={isLoading}
                  buttonText="Save Password"
                >
                  <FormField
                    control={form.control}
                    name="currentPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Current Password</FormLabel>
                        <FormControl>
                          <Input type="password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="newPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>New Password</FormLabel>
                        <FormControl>
                          <Input type="password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="confirmNewPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirm New Password</FormLabel>
                        <FormControl>
                          <Input type="password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </SettingsCard>

                {/* 2FA Settings Card */}
                <SettingsCard
                  title="Two-Factor Authentication (2FA)"
                  description="Add an extra layer of security to your account"
                  isLoading={isLoading}
                  buttonText="Save 2FA Settings"
                >
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
                </SettingsCard>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </>
  );
}
