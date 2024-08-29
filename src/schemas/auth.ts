import { z } from "zod";

export const registerSchema = z
  .object({
    firstName: z
      .string({
        required_error: "First name is required",
      })
      .min(2, "First name must have at least 2 characters")
      .max(12, "First name must be up to 12 characters"),
    lastName: z
      .string({
        required_error: "Last name is required",
      })
      .min(2, "Last name must have at least 2 characters")
      .max(12, "Last name must be up to 12 characters"),
    email: z
      .string({ required_error: "Email is required" })
      .email("Please enter a valid email address"),
    password: z
      .string({ required_error: "Password is required" })
      .min(8, "Password must have at least 8 characters")
      .max(32, "Password must be up to 32 characters")
      .regex(
        new RegExp(
          "^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[^a-zA-Z0-9]).{6,32}$",
        ),
        "Password must contain at least 1 small letter, 1 capital letter, 1 number, and 1 special character",
      ),
    confirmPassword: z
      .string({ required_error: "Confirm your password is required" })
      .min(8, "Password must have at least 8 characters")
      .max(32, "Password must be up to 32 characters")
      .optional(),
    role: z.string().min(2, "Role must have at least 2 characters").optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Password and Confirm Password do not match!",
    path: ["confirmPassword"],
  });

export const loginSchema = z.object({
  email: z
    .string({ required_error: "Please enter your email" })
    .email("Please enter a valid email address"),
  password: z
    .string({ required_error: "Password is required" })
    .min(1, "Password is required")
    .min(8, "Password must be more than 8 characters")
    .max(32, "Password must be less than 32 characters"),
  code: z
    .string()
    .min(6, "2FA code must be at least 6 characters")
    .max(6, "2FA code must be exactly 6 characters")
    .optional(),
});

export const resetPasswordSchema = z.object({
  email: z
    .string({ required_error: "Please enter your email" })
    .email("Please enter a valid email address"),
});

export const setNewPasswordSchema = z.object({
  token: z.string().uuid(),
  password: z
    .string({ required_error: "Password is required" })
    .min(1, "Password is required")
    .min(8, "Password must be more than 8 characters")
    .max(32, "Password must be less than 32 characters"),
});
