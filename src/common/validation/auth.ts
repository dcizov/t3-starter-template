import { z } from "zod";

export const registerSchema = z
  .object({
    name: z
      .string({
        required_error: "Name is required",
      })
      .min(2, "Name must have at least 2 characters")
      .max(12, "Name must be up to 12 characters"),
    email: z
      .string({ required_error: "Email is required" })
      .email("Please enter a valid email address"),
    password: z
      .string({ required_error: "Password is required" })
      .min(8, "Password must have at least 6 characters")
      .max(32, "Password must be up to 32 characters")
      .regex(
        new RegExp(
          "^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[^a-zA-Z0-9]).{6,20}$",
        ),
        "Password must contain at least 1 small letter, 1 capital letter, 1 number and 1 special character",
      ),
    confirmPassword: z
      .string({ required_error: "Confirm your password is required" })
      .min(8, "Password must have at least 6 characters")
      .max(20, "Password must be up to 20 characters"),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: "Password and Confirm Password doesn't match!",
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
});
