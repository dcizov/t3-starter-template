import { randomUUID } from "crypto";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { credentialsVerificationTokens } from "@/server/db/schema";
import { fromDate } from "@/lib/utils";
import {
  deleteVerificationToken,
  getVerificationTokenByEmail,
  getVerificationTokenById,
} from "@/lib/token-utils";
import { eq } from "drizzle-orm";

export const tokenRouter = createTRPCRouter({
  generateVerificationToken: publicProcedure
    .input(z.object({ email: z.string().email() }))
    .mutation(async ({ ctx, input }) => {
      const { email } = input;
      const token = randomUUID();
      const expires = fromDate(60 * 60 * 24);

      try {
        const existingToken = await getVerificationTokenByEmail({ email });

        if (existingToken) {
          await deleteVerificationToken({ id: existingToken.id });
        }
      } catch (error) {
        if (!(error instanceof TRPCError) || error.code !== "NOT_FOUND") {
          console.error(
            "Unexpected error while checking for existing token:",
            error,
          );
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message:
              "An unexpected error occurred while processing your request",
          });
        }
      }

      const [verificationToken] = await ctx.db
        .insert(credentialsVerificationTokens)
        .values({
          token,
          email,
          expires,
        })
        .returning();

      if (!verificationToken) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to generate verification token",
        });
      }

      return {
        success: true,
        email: verificationToken.email,
        token: verificationToken.token,
      };
    }),

  getVerificationTokenById: publicProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const { id } = input;

      const verificationToken =
        await ctx.db.query.credentialsVerificationTokens.findFirst({
          where: (credentialsVerificationTokens, { eq }) =>
            eq(credentialsVerificationTokens.id, id),
        });

      if (!verificationToken) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Verification token not found",
        });
      }

      return verificationToken;
    }),

  getVerificationTokenByEmail: publicProcedure
    .input(z.object({ email: z.string().email() }))
    .query(async ({ ctx, input }) => {
      const { email } = input;

      const verificationToken =
        await ctx.db.query.credentialsVerificationTokens.findFirst({
          where: (credentialsVerificationTokens, { eq }) =>
            eq(credentialsVerificationTokens.email, email),
        });

      if (!verificationToken) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Verification token not found",
        });
      }

      return verificationToken;
    }),

  getVerificationTokenByToken: publicProcedure
    .input(z.object({ token: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const { token } = input;

      const verificationToken =
        await ctx.db.query.credentialsVerificationTokens.findFirst({
          where: (credentialsVerificationTokens, { eq }) =>
            eq(credentialsVerificationTokens.token, token),
        });

      if (!verificationToken) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Verification token not found",
        });
      }

      return verificationToken;
    }),

  deleteVerificationToken: publicProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { id } = input;

      const verificationToken = await getVerificationTokenById({ id });

      if (!verificationToken) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Verification token not found",
        });
      }

      await ctx.db
        .delete(credentialsVerificationTokens)
        .where(eq(credentialsVerificationTokens.id, id));

      return {
        success: true,
        message: "Verification token deleted successfully",
      };
    }),
});
