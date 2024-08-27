import { randomUUID } from "crypto";
import { passwordResetTokens } from "@/server/db/schema";
import { fromDate } from "@/lib/utils";
import { eq } from "drizzle-orm";
import { type createTRPCContext } from "@/server/api/trpc";
import { db } from "@/server/db";

type Context =
  ReturnType<typeof createTRPCContext> extends Promise<infer T> ? T : never;

/**
 * Generates a new password reset token for the given email.
 * If a token already exists for the email, it is deleted before creating a new one.
 * @param ctx The database context (optional)
 * @param email The email address to generate the token for
 * @returns The generated password reset token, or null if creation failed
 */
export async function generatePasswordResetToken(
  ctx: Context | undefined,
  email: string,
) {
  const dbInstance = ctx?.db ?? db;

  const token = randomUUID();
  const expires = fromDate(60 * 60 * 24);

  const existingToken = await dbInstance.query.passwordResetTokens.findFirst({
    where: (passwordResetTokens, { eq }) =>
      eq(passwordResetTokens.email, email),
  });

  if (existingToken) {
    await dbInstance
      .delete(passwordResetTokens)
      .where(eq(passwordResetTokens.id, existingToken.id))
      .returning();
  }

  const [passwordResetToken] = await dbInstance
    .insert(passwordResetTokens)
    .values({
      token,
      email,
      expires,
    })
    .returning();

  return passwordResetToken ?? null;
}

/**
 * Retrieves a password reset token by its ID.
 * @param ctx The database context (optional)
 * @param id The ID of the password reset token
 * @returns The password reset token if found, otherwise null
 */
export async function getPasswordResetTokenById(
  ctx: Context | undefined,
  id: string,
) {
  const dbInstance = ctx?.db ?? db;

  const passwordResetToken =
    await dbInstance.query.passwordResetTokens.findFirst({
      where: (passwordResetTokens, { eq }) => eq(passwordResetTokens.id, id),
    });

  return passwordResetToken ?? null;
}

/**
 * Retrieves a password reset token by email address.
 * @param ctx The database context (optional)
 * @param email The email address associated with the token
 * @returns The password reset token if found, otherwise null
 */
export async function getPasswordResetTokenByEmail(
  ctx: Context | undefined,
  email: string,
) {
  const dbInstance = ctx?.db ?? db;

  const passwordResetToken =
    await dbInstance.query.passwordResetTokens.findFirst({
      where: (passwordResetTokens, { eq }) =>
        eq(passwordResetTokens.email, email),
    });

  return passwordResetToken ?? null;
}

/**
 * Retrieves a password reset token by its token value.
 * @param ctx The database context (optional)
 * @param token The token value to search for
 * @returns The password reset token if found, otherwise null
 */
export async function getPasswordResetTokenByToken(
  ctx: Context | undefined,
  token: string,
) {
  const dbInstance = ctx?.db ?? db;

  const passwordResetToken =
    await dbInstance.query.passwordResetTokens.findFirst({
      where: (passwordResetTokens, { eq }) =>
        eq(passwordResetTokens.token, token),
    });

  return passwordResetToken ?? null;
}

/**
 * Deletes a password reset token by its ID.
 * @param ctx The database context (optional)
 * @param id The ID of the password reset token to delete
 * @returns True if the token was successfully deleted, otherwise false
 */
export async function deletePasswordResetToken(
  ctx: Context | undefined,
  id: string,
) {
  const dbInstance = ctx?.db ?? db;

  const result = await dbInstance
    .delete(passwordResetTokens)
    .where(eq(passwordResetTokens.id, id))
    .returning();

  return result.length > 0;
}
