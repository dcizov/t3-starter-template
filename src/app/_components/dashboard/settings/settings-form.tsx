"use client";

import { useState, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { api } from "@/trpc/react";
import { updateSettingsSchema } from "@/schemas/settings";
import type { Session } from "next-auth";
import type { z } from "zod";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/app/_components/ui/card";
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
import { SettingsCard } from "@/app/_components/dashboard/settings/settings-card";
import ProfileImageCard from "@/app/_components/dashboard/settings/profile-image-card";

type InputType = z.infer<typeof updateSettingsSchema>;
type FormFields = keyof InputType;
type SectionType = "personal" | "password" | "twoFactor" | "profileImage";

interface SettingsFormProps {
  session: Session | null;
}

export default function SettingsForm({ session }: SettingsFormProps) {
  const user = session?.user;
  const [loadingStates, setLoadingStates] = useState<
    Record<SectionType, boolean>
  >({
    personal: false,
    password: false,
    twoFactor: false,
    profileImage: false,
  });

  const defaultValues: Partial<InputType> = useMemo(
    () => ({
      id: user?.id ?? "",
      firstName: user?.firstName ?? "",
      lastName: user?.lastName ?? "",
      email: user?.email ?? "",
      bio: user?.bio ?? "",
      isTwoFactorEnabled: user?.isTwoFactorEnabled ?? false,
      currentPassword: "",
      newPassword: "",
      confirmNewPassword: "",
    }),
    [user],
  );

  const form = useForm<InputType>({
    defaultValues,
    resolver: zodResolver(updateSettingsSchema),
  });

  const [dirtyStates, setDirtyStates] = useState<Record<SectionType, boolean>>({
    personal: false,
    password: false,
    twoFactor: false,
    profileImage: false,
  });

  useEffect(() => {
    const subscription = form.watch((value, { name, type }) => {
      if (type === "change") {
        const section = name
          ? getSectionFromFieldName(name as FormFields)
          : null;
        if (section) {
          setDirtyStates((prev) => ({
            ...prev,
            [section]: !isEqual(value[name!], defaultValues[name!]),
          }));
        }
      }
    });
    return () => subscription.unsubscribe();
  }, [form, defaultValues]);

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

  const onSubmit = async (data: Partial<InputType>, section: SectionType) => {
    setLoadingStates((prev) => ({ ...prev, [section]: true }));
    try {
      const dataToUpdate: Partial<InputType> = { id: user?.id ?? "", ...data };
      await mutateAsync(dataToUpdate as InputType);
      form.reset(dataToUpdate);
      setDirtyStates((prev) => ({ ...prev, [section]: false }));
    } catch (error) {
      console.error(`${section} settings update failed:`, error);
    } finally {
      setLoadingStates((prev) => ({ ...prev, [section]: false }));
    }
  };

  const handleCancel = () => {
    form.reset(defaultValues);
    setDirtyStates({
      personal: false,
      password: false,
      twoFactor: false,
      profileImage: false,
    });
  };

  return (
    <Card className="mt-6 rounded-lg border-none">
      <CardHeader className="space-y-1 p-6">
        <CardTitle className="text-2xl font-bold">Settings</CardTitle>
        <CardDescription className="text-sm text-muted-foreground">
          Update your account settings
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <Form {...form}>
          {/* Responsive container for Profile Image and Personal Information cards */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Personal Information Card */}
            <SettingsCard
              title="Personal Information"
              description="Update your personal information"
              isLoading={loadingStates.personal}
              isCardDirty={dirtyStates.personal}
              onSubmit={() =>
                onSubmit(
                  {
                    firstName: form.getValues("firstName"),
                    lastName: form.getValues("lastName"),
                    email: form.getValues("email"),
                    bio: form.getValues("bio"),
                  },
                  "personal",
                )
              }
              onCancel={handleCancel}
            >
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <Input type="text" placeholder="John" {...field} />
                    </FormControl>
                    <FormDescription>
                      Your first name as it appears on your official documents.
                    </FormDescription>
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
                      <Input type="text" placeholder="Doe" {...field} />
                    </FormControl>
                    <FormDescription>
                      Your last name as it appears on your official documents.
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
                        type="email"
                        placeholder="john.doe@example.com"
                        {...field}
                      />
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
                        placeholder="Tell us something about yourself"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      A brief description about yourself. This will be visible
                      to other users.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </SettingsCard>
            {/* Profile Image Card */}
            <SettingsCard
              title="Profile Image"
              description="Upload a profile picture"
              isLoading={loadingStates.profileImage}
              isCardDirty={dirtyStates.profileImage}
              onSubmit={() => onSubmit({}, "profileImage")}
              onCancel={handleCancel}
            >
              <ProfileImageCard
                currentImageUrl={user?.image ?? ""}
                onImageUpload={(file) => {
                  // Handle image upload logic
                  setDirtyStates((prev) => ({ ...prev, profileImage: true }));
                }}
                onImageRemove={() => {
                  // Handle image removal logic
                  setDirtyStates((prev) => ({ ...prev, profileImage: true }));
                }}
              />
            </SettingsCard>
          </div>

          {/* Password Card */}
          <div className="mt-6">
            <SettingsCard
              title="Password"
              description="Update your password"
              isLoading={loadingStates.password}
              isCardDirty={dirtyStates.password}
              onSubmit={() =>
                onSubmit(
                  {
                    currentPassword: form.getValues("currentPassword"),
                    newPassword: form.getValues("newPassword"),
                    confirmNewPassword: form.getValues("confirmNewPassword"),
                  },
                  "password",
                )
              }
              onCancel={handleCancel}
            >
              <FormField
                control={form.control}
                name="currentPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="******" {...field} />
                    </FormControl>
                    <FormDescription>
                      Enter your current password for security verification.
                    </FormDescription>
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
                      <Input type="password" placeholder="******" {...field} />
                    </FormControl>
                    <FormDescription>
                      Choose a strong password with at least 8 characters,
                      including uppercase, lowercase, numbers, and symbols.
                    </FormDescription>
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
                      <Input type="password" placeholder="******" {...field} />
                    </FormControl>
                    <FormDescription>
                      Re-enter your new password to confirm.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </SettingsCard>
          </div>

          {/* Two-Factor Authentication Card */}
          <div className="mt-6">
            <SettingsCard
              title="Two-Factor Authentication (2FA)"
              description="Add an extra layer of security to your account"
              isLoading={loadingStates.twoFactor}
              isCardDirty={dirtyStates.twoFactor}
              onSubmit={() =>
                onSubmit(
                  {
                    isTwoFactorEnabled: form.getValues("isTwoFactorEnabled"),
                  },
                  "twoFactor",
                )
              }
              onCancel={handleCancel}
            >
              <FormField
                control={form.control}
                name="isTwoFactorEnabled"
                render={({ field }) => (
                  <FormItem className="flex flex-col space-y-2">
                    <div className="flex items-center space-x-2">
                      <FormLabel>Enable 2FA</FormLabel>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </div>
                    <FormDescription>
                      Secure your account by enabling two-factor authentication.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </SettingsCard>
          </div>
        </Form>
      </CardContent>
    </Card>
  );
}

// Utility functions
function getSectionFromFieldName(fieldName: FormFields): SectionType {
  if (["firstName", "lastName", "email", "bio"].includes(fieldName)) {
    return "personal";
  }
  if (
    ["currentPassword", "newPassword", "confirmNewPassword"].includes(fieldName)
  ) {
    return "password";
  }
  if (fieldName === "isTwoFactorEnabled") {
    return "twoFactor";
  }
  // if (fieldName === "profileImage") {
  //   return "profileImage";
  // }
  throw new Error(`Unknown field name: ${fieldName}`);
}

function isEqual(a: unknown, b: unknown): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}
