import { randomUUID } from "crypto";
import { credentialsVerificationTokens } from "@/server/db/schema";
import { fromDate } from "@/lib/utils";
import { eq } from "drizzle-orm";
import { type createTRPCContext } from "@/server/api/trpc";

type Context =
  ReturnType<typeof createTRPCContext> extends Promise<infer T> ? T : never;

export async function generateVerificationToken(ctx: Context, email: string) {
  const token = randomUUID();
  const expires = fromDate(60 * 60 * 24);

  const existingToken =
    await ctx.db.query.credentialsVerificationTokens.findFirst({
      where: (credentialsVerificationTokens, { eq }) =>
        eq(credentialsVerificationTokens.email, email),
    });

  if (existingToken) {
    await ctx.db
      .delete(credentialsVerificationTokens)
      .where(eq(credentialsVerificationTokens.id, existingToken.id))
      .returning();
  }

  const [verificationToken] = await ctx.db
    .insert(credentialsVerificationTokens)
    .values({
      token,
      email,
      expires,
    })
    .returning();

  return verificationToken ?? null;
}

export async function getVerificationTokenById(ctx: Context, id: string) {
  const verificationToken =
    await ctx.db.query.credentialsVerificationTokens.findFirst({
      where: (credentialsVerificationTokens, { eq }) =>
        eq(credentialsVerificationTokens.id, id),
    });

  return verificationToken ?? null;
}

export async function getVerificationTokenByEmail(ctx: Context, email: string) {
  const verificationToken =
    await ctx.db.query.credentialsVerificationTokens.findFirst({
      where: (credentialsVerificationTokens, { eq }) =>
        eq(credentialsVerificationTokens.email, email),
    });

  return verificationToken ?? null;
}

export async function getVerificationTokenByToken(ctx: Context, token: string) {
  const verificationToken =
    await ctx.db.query.credentialsVerificationTokens.findFirst({
      where: (credentialsVerificationTokens, { eq }) =>
        eq(credentialsVerificationTokens.token, token),
    });

  return verificationToken ?? null;
}

export async function deleteVerificationToken(ctx: Context, id: string) {
  const result = await ctx.db
    .delete(credentialsVerificationTokens)
    .where(eq(credentialsVerificationTokens.id, id))
    .returning();

  return result.length > 0;
}
