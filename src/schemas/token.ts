import { z } from "zod";

// Schema for email input
export const tokenByEmailSchema = z.object({
  email: z.string().email(),
});

// Schema for ID input
export const tokenByIdSchema = z.object({
  id: z.string().uuid(),
});

// Schema for token input
export const tokenByTokenSchema = z.object({
  token: z.string().uuid(),
});
