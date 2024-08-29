import { randomInt } from "crypto";
import { twoFactorTokens } from "@/server/db/schema";
import { fromDate } from "@/lib/utils";
import { eq } from "drizzle-orm";
import { type createTRPCContext } from "@/server/api/trpc";
import { db } from "@/server/db";

type Context =
  ReturnType<typeof createTRPCContext> extends Promise<infer T> ? T : never;

/**
 * Generates a new 2FA authentication token for the given email.
 * If a token already exists for the email, it is deleted before creating a new one.
 * @param ctx The database context (optional)
 * @param email The email address to generate the token for
 * @returns The generated 2FA token, or null if creation failed
 */
export async function generateTwoFactorToken(
  ctx: Context | undefined,
  email: string,
) {
  const dbInstance = ctx?.db ?? db;

  const token = randomInt(100_000, 1_000_000).toString();
  const expires = fromDate(60 * 5);

  const existingToken = await getTwoFactorTokenByEmail(ctx, email);

  if (existingToken) {
    await deleteTwoFactorToken(ctx, existingToken.id);
  }

  const [twoFactorToken] = await dbInstance
    .insert(twoFactorTokens)
    .values({
      email,
      token,
      expires,
    })
    .returning();

  return twoFactorToken ?? null;
}

/**
 * Retrieves a 2FA authentication token by its ID.
 * @param ctx The database context (optional)
 * @param id The ID of the 2FA token
 * @returns The 2FA token if found, otherwise null
 */
export async function getTwoFactorTokenById(
  ctx: Context | undefined,
  id: string,
) {
  const dbInstance = ctx?.db ?? db;

  const twoFactorToken = await dbInstance.query.twoFactorTokens.findFirst({
    where: (twoFactorTokens, { eq }) => eq(twoFactorTokens.id, id),
  });

  return twoFactorToken ?? null;
}

/**
 * Retrieves a 2FA authentication token by email address.
 * @param ctx The database context (optional)
 * @param email The email address associated with the token
 * @returns The 2FA token if found, otherwise null
 */
export async function getTwoFactorTokenByEmail(
  ctx: Context | undefined,
  email: string,
) {
  const dbInstance = ctx?.db ?? db;

  const twoFactorToken = await dbInstance.query.twoFactorTokens.findFirst({
    where: (twoFactorTokens, { eq }) => eq(twoFactorTokens.email, email),
  });

  return twoFactorToken ?? null;
}

/**
 * Retrieves a 2FA authentication token by its token value.
 * @param ctx The database context (optional)
 * @param token The token value to search for
 * @returns The 2FA token if found, otherwise null
 */
export async function getTwoFactorTokenByToken(
  ctx: Context | undefined,
  token: string,
) {
  const dbInstance = ctx?.db ?? db;

  const twoFactorToken = await dbInstance.query.twoFactorTokens.findFirst({
    where: (twoFactorTokens, { eq }) => eq(twoFactorTokens.token, token),
  });

  return twoFactorToken ?? null;
}

/**
 * Deletes a 2FA authentication token by its ID.
 * @param ctx The database context (optional)
 * @param id The ID of the 2FA token to delete
 * @returns True if the token was successfully deleted, otherwise false
 */
export async function deleteTwoFactorToken(
  ctx: Context | undefined,
  id: string,
) {
  const dbInstance = ctx?.db ?? db;

  const result = await dbInstance
    .delete(twoFactorTokens)
    .where(eq(twoFactorTokens.id, id))
    .returning();

  return result.length > 0;
}
