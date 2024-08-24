import { z } from "zod";

// Create User Schema
export const createUserSchema = z
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
      .min(8, "Password must have at least 6 characters")
      .max(32, "Password must be up to 32 characters")
      .regex(
        new RegExp(
          "^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[^a-zA-Z0-9]).{6,32}$",
        ),
        "Password must contain at least 1 small letter, 1 capital letter, 1 number, and 1 special character",
      ),
    confirmPassword: z
      .string({ required_error: "Confirm your password is required" })
      .min(8, "Password must have at least 6 characters")
      .max(32, "Password must be up to 32 characters"),
    role: z
      .string({ required_error: "Role is required" })
      .min(2, "Role must have at least 2 characters"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Password and Confirm Password do not match!",
    path: ["confirmPassword"],
  });

// Update User Schema
export const updateUserSchema = z.object({
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
  email: z.string().email("Please enter a valid email address").optional(),
  password: z
    .string()
    .min(8, "Password must have at least 6 characters")
    .max(32, "Password must be up to 32 characters")
    .regex(
      new RegExp(
        "^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[^a-zA-Z0-9]).{6,32}$",
      ),
      "Password must contain at least 1 small letter, 1 capital letter, 1 number, and 1 special character",
    )
    .optional(),
  role: z.string().min(2, "Role must have at least 2 characters").optional(),
  emailVerified: z.date().optional(),
});

// Delete User Schema
export const deleteUserSchema = z.object({
  id: z.string().uuid({ message: "Invalid user ID" }),
});

// Get User by Email Schema
export const getUserByEmailSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

// Get User by ID Schema
export const getUserByIdSchema = z.object({
  id: z.string().uuid({ message: "Invalid user ID" }),
});

// Get User by Name Schema
export const getUserByNameSchema = z.object({
  name: z.string().min(1, "Name is required"),
});
