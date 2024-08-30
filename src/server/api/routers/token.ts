import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import {
  generatePasswordResetToken,
  getPasswordResetTokenById,
  getPasswordResetTokenByEmail,
  getPasswordResetTokenByToken,
  deletePasswordResetToken,
  generateVerificationToken,
  getVerificationTokenById,
  getVerificationTokenByEmail,
  getVerificationTokenByToken,
  deleteVerificationToken,
} from "@/server/api/utils/auth";
import {
  tokenByEmailSchema,
  tokenByIdSchema,
  tokenByTokenSchema,
} from "@/schemas/token";

export const tokenRouter = createTRPCRouter({
  generateVerificationToken: publicProcedure
    .input(tokenByEmailSchema)
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
    .input(tokenByIdSchema)
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
    .input(tokenByEmailSchema)
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
    .input(tokenByTokenSchema)
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
    .input(tokenByIdSchema)
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

  generatePasswordResetToken: publicProcedure
    .input(tokenByEmailSchema)
    .mutation(async ({ ctx, input }) => {
      const passwordResetToken = await generatePasswordResetToken(
        ctx,
        input.email,
      );

      if (!passwordResetToken) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to generate password reset token",
        });
      }

      return {
        success: true,
        email: passwordResetToken.email,
        token: passwordResetToken.token,
      };
    }),

  getPasswordResetTokenById: publicProcedure
    .input(tokenByIdSchema)
    .query(async ({ ctx, input }) => {
      const passwordResetToken = await getPasswordResetTokenById(ctx, input.id);

      if (!passwordResetToken) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Password reset token not found",
        });
      }

      return passwordResetToken;
    }),

  getPasswordResetTokenByEmail: publicProcedure
    .input(tokenByEmailSchema)
    .query(async ({ ctx, input }) => {
      const passwordResetToken = await getPasswordResetTokenByEmail(
        ctx,
        input.email,
      );

      if (!passwordResetToken) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Password reset token not found",
        });
      }

      return passwordResetToken;
    }),

  getPasswordResetTokenByToken: publicProcedure
    .input(tokenByTokenSchema)
    .query(async ({ ctx, input }) => {
      const passwordResetToken = await getPasswordResetTokenByToken(
        ctx,
        input.token,
      );

      if (!passwordResetToken) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Password reset token not found",
        });
      }

      return passwordResetToken;
    }),

  deletePasswordResetToken: publicProcedure
    .input(tokenByIdSchema)
    .mutation(async ({ ctx, input }) => {
      const success = await deletePasswordResetToken(ctx, input.id);

      if (!success) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Password reset token not found",
        });
      }

      return {
        success: true,
        message: "Password reset token deleted successfully",
      };
    }),
});
