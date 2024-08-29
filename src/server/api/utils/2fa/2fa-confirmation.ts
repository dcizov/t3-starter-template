import { eq } from "drizzle-orm";
import { type createTRPCContext } from "@/server/api/trpc";
import { db } from "@/server/db";
import { twoFactorConfirmations } from "@/server/db/schema";

type Context =
  ReturnType<typeof createTRPCContext> extends Promise<infer T> ? T : never;

/**
 * Generates a new 2FA authentication confirmation for the given user ID.
 * @param ctx The database context (optional)
 * @param userId The user ID associated with the 2FA confirmation
 * @returns The newly generated 2FA confirmation record, or null if an error occurred
 */
export async function generateTwoFactorConfirmation(
  ctx: Context | undefined,
  userId: string,
) {
  const dbInstance = ctx?.db ?? db;

  const existingConfirmation = await getTwoFactorConfirmationByUserId(
    ctx,
    userId,
  );

  if (existingConfirmation) {
    await deleteTwoFactorConfirmation(ctx, existingConfirmation.id);
  }

  const [twoFactorConfirmation] = await dbInstance
    .insert(twoFactorConfirmations)
    .values({
      userId,
    })
    .returning();

  return twoFactorConfirmation ?? null;
}

/**
 * Retrieves a 2FA authentication confirmation by user ID.
 * @param ctx The database context (optional)
 * @param userId The user ID associated with the confirmation
 * @returns The 2FA confirmation record if found, otherwise null
 */
export async function getTwoFactorConfirmationByUserId(
  ctx: Context | undefined,
  userId: string,
) {
  const dbInstance = ctx?.db ?? db;

  const twoFactorConfirmation =
    await dbInstance.query.twoFactorConfirmations.findFirst({
      where: (twoFactorConfirmations, { eq }) =>
        eq(twoFactorConfirmations.userId, userId),
    });

  return twoFactorConfirmation ?? null;
}

/**
 * Deletes a 2FA authentication confirmation by ID.
 * @param ctx The database context (optional)
 * @param userId The user ID associated with the confirmation
 * @returns True if the confirmation was successfully deleted, otherwise false
 */
export async function deleteTwoFactorConfirmation(
  ctx: Context | undefined,
  id: string,
) {
  const dbInstance = ctx?.db ?? db;

  const result = await dbInstance
    .delete(twoFactorConfirmations)
    .where(eq(twoFactorConfirmations.id, id))
    .returning({ id: twoFactorConfirmations.id });

  return result.length > 0;
}
