import { z } from "zod";

const passwordRegex = new RegExp(
  "^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[^a-zA-Z0-9]).{8,32}$",
);

export const updateSettingsSchema = z
  .object({
    id: z.string().uuid({ message: "Invalid user ID" }),
    firstName: z
      .string()
      .min(2, "First name must have at least 2 characters")
      .max(12, "First name must be up to 12 characters")
      .optional(),
    lastName: z
      .string()
      .min(2, "Last name must have at least 2 characters")
      .max(12, "Last name must be up to 12 characters")
      .optional(),
    name: z.string().optional(),
    email: z.string().email("Please enter a valid email address").optional(),
    currentPassword: z
      .string()
      .min(8, "Current password must have at least 8 characters")
      .optional(),
    newPassword: z
      .string()
      .min(8, "New password must have at least 8 characters")
      .max(32, "New password must be up to 32 characters")
      .regex(
        passwordRegex,
        "New password must contain at least 1 small letter, 1 capital letter, 1 number, and 1 special character",
      )
      .optional(),
    confirmNewPassword: z.string().optional(),
    bio: z.string().optional(),
    isTwoFactorEnabled: z.boolean().optional(),
  })
  .partial()
  .refine(
    (data) => {
      if (data.newPassword ?? data.confirmNewPassword) {
        return data.newPassword === data.confirmNewPassword;
      }
      return true;
    },
    {
      message: "New password and confirm new password do not match",
      path: ["confirmNewPassword"],
    },
  )
  .refine(
    (data) => {
      if (data.newPassword) {
        return !!data.currentPassword;
      }
      return true;
    },
    {
      message: "Current password is required when setting a new password",
      path: ["currentPassword"],
    },
  );
