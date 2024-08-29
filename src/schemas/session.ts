import { z } from "zod";

export const createSessionSchema = z.object({
  userId: z.string(),
});

export const deleteSessionSchema = z.object({
  sessionToken: z.string(),
});
