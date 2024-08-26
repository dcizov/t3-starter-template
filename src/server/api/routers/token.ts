import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import {
  generateVerificationToken,
  getVerificationTokenById,
  getVerificationTokenByEmail,
  getVerificationTokenByToken,
  deleteVerificationToken,
} from "@/server/api/utils/token";

export const tokenRouter = createTRPCRouter({
  generateVerificationToken: publicProcedure
    .input(z.object({ email: z.string().email() }))
    .mutation(async ({ ctx, input }) => {
      const verificationToken = await generateVerificationToken(
        ctx,
        input.email,
      );

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
      const verificationToken = await getVerificationTokenById(ctx, input.id);

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
      const verificationToken = await getVerificationTokenByEmail(
        ctx,
        input.email,
      );

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
      const verificationToken = await getVerificationTokenByToken(
        ctx,
        input.token,
      );

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
      const success = await deleteVerificationToken(ctx, input.id);

      if (!success) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Verification token not found",
        });
      }

      return {
        success: true,
        message: "Verification token deleted successfully",
      };
    }),
});
