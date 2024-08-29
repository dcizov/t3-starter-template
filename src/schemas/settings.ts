import { z } from "zod";

export const settingsSchema = z
  .object({
    username: z
      .string()
      .min(2, "Username must be at least 2 characters")
      .max(30, "Username must not exceed 30 characters"),
    email: z.string().email("Invalid email address"),
    bio: z.string().max(160, "Bio must not exceed 160 characters").optional(),
    two_factor: z.boolean().default(false).optional(),
    two_factor_method: z.enum(["email", "authenticator"]).optional(),
  })
  .refine(
    (data) => {
      if (data.two_factor && !data.two_factor_method) {
        return false;
      }
      return true;
    },
    {
      message: "Two-Factor Method is required if 2FA is enabled",
      path: ["two_factor_method"],
    },
  );
