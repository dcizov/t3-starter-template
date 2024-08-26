import { randomUUID } from "crypto";
import { credentialsVerificationTokens } from "@/server/db/schema";
import { fromDate } from "@/lib/utils";
import { eq } from "drizzle-orm";
import { type createTRPCContext } from "@/server/api/trpc";
import { db } from "@/server/db";

type Context =
  ReturnType<typeof createTRPCContext> extends Promise<infer T> ? T : never;

/**
 * Generates a new verification token for the given email.
 * If a token already exists for the email, it is deleted before creating a new one.
 * @param ctx The database context (optional)
 * @param email The email address to generate the token for
 * @returns The generated verification token, or null if creation failed
 */
export async function generateVerificationToken(
  ctx: Context | undefined,
  email: string,
) {
  const dbInstance = ctx?.db ?? db;

  const token = randomUUID();
  const expires = fromDate(60 * 60 * 24);

  const existingToken =
    await dbInstance.query.credentialsVerificationTokens.findFirst({
      where: (credentialsVerificationTokens, { eq }) =>
        eq(credentialsVerificationTokens.email, email),
    });

  if (existingToken) {
    await dbInstance
      .delete(credentialsVerificationTokens)
      .where(eq(credentialsVerificationTokens.id, existingToken.id))
      .returning();
  }

  const [verificationToken] = await dbInstance
    .insert(credentialsVerificationTokens)
    .values({
      token,
      email,
      expires,
    })
    .returning();

  return verificationToken ?? null;
}

/**
 * Retrieves a verification token by its ID.
 * @param ctx The database context (optional)
 * @param id The ID of the verification token
 * @returns The verification token if found, otherwise null
 */
export async function getVerificationTokenById(
  ctx: Context | undefined,
  id: string,
) {
  const dbInstance = ctx?.db ?? db;

  const verificationToken =
    await dbInstance.query.credentialsVerificationTokens.findFirst({
      where: (credentialsVerificationTokens, { eq }) =>
        eq(credentialsVerificationTokens.id, id),
    });

  return verificationToken ?? null;
}

/**
 * Retrieves a verification token by email address.
 * @param ctx The database context (optional)
 * @param email The email address associated with the token
 * @returns The verification token if found, otherwise null
 */
export async function getVerificationTokenByEmail(
  ctx: Context | undefined,
  email: string,
) {
  const dbInstance = ctx?.db ?? db;

  const verificationToken =
    await dbInstance.query.credentialsVerificationTokens.findFirst({
      where: (credentialsVerificationTokens, { eq }) =>
        eq(credentialsVerificationTokens.email, email),
    });

  return verificationToken ?? null;
}

/**
 * Retrieves a verification token by its token value.
 * @param ctx The database context (optional)
 * @param token The token value to search for
 * @returns The verification token if found, otherwise null
 */
export async function getVerificationTokenByToken(
  ctx: Context | undefined,
  token: string,
) {
  const dbInstance = ctx?.db ?? db;

  const verificationToken =
    await dbInstance.query.credentialsVerificationTokens.findFirst({
      where: (credentialsVerificationTokens, { eq }) =>
        eq(credentialsVerificationTokens.token, token),
    });

  return verificationToken ?? null;
}

/**
 * Deletes a verification token by its ID.
 * @param ctx The database context (optional)
 * @param id The ID of the verification token to delete
 * @returns True if the token was successfully deleted, otherwise false
 */
export async function deleteVerificationToken(
  ctx: Context | undefined,
  id: string,
) {
  const dbInstance = ctx?.db ?? db;

  const result = await dbInstance
    .delete(credentialsVerificationTokens)
    .where(eq(credentialsVerificationTokens.id, id))
    .returning();

  return result.length > 0;
}
