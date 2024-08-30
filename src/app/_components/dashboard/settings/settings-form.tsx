"use client";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/app/_components/ui/card";
import { useForm, useWatch } from "react-hook-form";
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
import { toast } from "sonner";
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
  const user = session?.user;
  const [loadingStates, setLoadingStates] = useState({
    general: false,
    password: false,
    twoFactor: false,
  });

  const form = useForm<InputType>({
    defaultValues: {
      id: user?.id ?? "",
      firstName: user?.firstName ?? "",
      lastName: user?.lastName ?? "",
      email: user?.email ?? "",
      bio: user?.bio ?? "",
      isTwoFactorEnabled: user?.isTwoFactorEnabled ?? false,
      currentPassword: "",
      newPassword: "",
      confirmNewPassword: "",
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

  const watchedFields = useWatch({ control: form.control });

  const onSubmit = async (
    data: Partial<InputType>,
    section: keyof typeof loadingStates,
  ) => {
    setLoadingStates((prev) => ({ ...prev, [section]: true }));
    try {
      const dataToUpdate: Partial<InputType> = { id: user?.id ?? "", ...data };
      await mutateAsync(dataToUpdate as InputType);
    } catch (error) {
      console.error(`${section} settings update failed:`, error);
    } finally {
      setLoadingStates((prev) => ({ ...prev, [section]: false }));
    }
  };

  return (
    <>
      <Card className="mt-6 rounded-lg border-none">
        <CardHeader className="space-y-1 p-6">
          <CardTitle className="text-2xl font-bold">Settings</CardTitle>
          <CardDescription className="text-sm text-muted-foreground">
            Update your account settings
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <Form {...form}>
            <div className="space-y-6">
              <SettingsCard
                title="General"
                description="Update general settings"
                isLoading={loadingStates.general}
                buttonText="Save General Settings"
                onSubmit={() =>
                  onSubmit(
                    {
                      firstName: watchedFields.firstName,
                      lastName: watchedFields.lastName,
                      email: watchedFields.email,
                      bio: watchedFields.bio,
                    },
                    "general",
                  )
                }
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
              <SettingsCard
                title="Password"
                description="Update your password"
                isLoading={loadingStates.password}
                buttonText="Save Password"
                onSubmit={() =>
                  onSubmit(
                    {
                      currentPassword: watchedFields.currentPassword,
                      newPassword: watchedFields.newPassword,
                      confirmNewPassword: watchedFields.confirmNewPassword,
                    },
                    "password",
                  )
                }
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
              <SettingsCard
                title="Two-Factor Authentication (2FA)"
                description="Add an extra layer of security to your account"
                isLoading={loadingStates.twoFactor}
                buttonText="Save 2FA Settings"
                onSubmit={() =>
                  onSubmit(
                    {
                      isTwoFactorEnabled: watchedFields.isTwoFactorEnabled,
                    },
                    "twoFactor",
                  )
                }
              >
                <FormField
                  control={form.control}
                  name="isTwoFactorEnabled"
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
          </Form>
        </CardContent>
      </Card>
    </>
  );
}
