import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import {
  registerSchema,
  loginSchema,
  createSessionSchema,
  resetPasswordSchema,
  setNewPasswordSchema,
} from "@/schemas/auth";
import {
  registerUser,
  loginUser,
  createSession,
  verifyEmailToken,
  resetPassword,
  setNewPassword,
} from "@/server/api/utils/auth";
import { handleTwoFactorAuthentication } from "../utils/2fa";

const verifyEmailSchema = z.object({
  token: z.string().nonempty("Token is required"),
});

export const authRouter = createTRPCRouter({
  register: publicProcedure
    .input(registerSchema)
    .mutation(async ({ ctx, input }) => {
      const { firstName, lastName, email, password } = input;

      const result = await registerUser(
        ctx,
        firstName,
        lastName,
        email,
        password,
      );

      if (!result) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "User already exists or failed to create user",
        });
      }

      return {
        success: true,
        message: "User registered successfully",
        emailSent: result.verificationEmailSent,
      };
    }),

  login: publicProcedure.input(loginSchema).mutation(async ({ ctx, input }) => {
    const { email, password, code } = input;

    const res = await loginUser(ctx, email, password);

    if (!res.success) {
      const errorMap: Record<string, TRPCError> = {
        USER_NOT_FOUND: new TRPCError({
          code: "NOT_FOUND",
          message: "User does not exist",
        }),
        EMAIL_NOT_VERIFIED: new TRPCError({
          code: "UNAUTHORIZED",
          message: "Email not verified",
        }),
        INVALID_CREDENTIALS: new TRPCError({
          code: "UNAUTHORIZED",
          message: "Invalid credentials",
        }),
      };

      const error = res.error ? errorMap[res.error] : undefined;

      if (error) {
        throw error;
      } else {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "An unexpected error occurred",
        });
      }
    }

    if (!res.user) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "User information is missing",
      });
    }

    const twoFactorResponse = await handleTwoFactorAuthentication(
      ctx,
      res.user.id,
      res.user.email,
      res.user.isTwoFactorEnabled,
      code,
    );

    return {
      success: true,
      message: "Login successful",
      user: res.user,
      twoFactor: twoFactorResponse.twoFactor,
    };
  }),

  createSession: publicProcedure
    .input(createSessionSchema)
    .mutation(async ({ ctx, input }) => {
      const success = await createSession(ctx, input.userId);

      if (!success) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create session",
        });
      }

      return { success: true };
    }),

  verifyEmail: publicProcedure
    .input(verifyEmailSchema)
    .mutation(async ({ ctx, input }) => {
      const { token } = input;

      const res = await verifyEmailToken(ctx, token);

      if (!res.success) {
        const errorMap: Record<string, TRPCError> = {
          INVALID_TOKEN: new TRPCError({
            code: "BAD_REQUEST",
            message: "Token does not exist",
          }),
          EXPIRED_TOKEN: new TRPCError({
            code: "BAD_REQUEST",
            message: "Token has expired!",
          }),
          EMAIL_NOT_EXIST: new TRPCError({
            code: "NOT_FOUND",
            message: "Email does not exist!",
          }),
          UPDATE_FAILED: new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to update user",
          }),
        };

        const error = res.error ? errorMap[res.error] : undefined;

        if (error) {
          throw error;
        } else {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "An unexpected error occurred",
          });
        }
      }

      return {
        success: true,
        message: res.message ?? "Email verified successfully",
      };
    }),

  resetPassword: publicProcedure
    .input(resetPasswordSchema)
    .mutation(async ({ ctx, input }) => {
      const { email } = input;

      const res = await resetPassword(ctx, email);

      if (!res.success) {
        const errorMap: Record<string, TRPCError> = {
          EMAIL_NOT_FOUND: new TRPCError({
            code: "NOT_FOUND",
            message: "Email not found",
          }),
          EMAIL_SEND_FAILED: new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to send password reset email",
          }),
        };

        const error = res.error ? errorMap[res.error] : undefined;

        if (error) {
          throw error;
        } else {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "An unexpected error occurred",
          });
        }
      }

      return {
        success: true,
        message: "Password reset email sent successfully",
      };
    }),

  setNewPassword: publicProcedure
    .input(setNewPasswordSchema)
    .mutation(async ({ ctx, input }) => {
      const { password, token } = input;

      const res = await setNewPassword(ctx, password, token);

      if (!res.success) {
        const errorMap: Record<string, TRPCError> = {
          MISSING_TOKEN: new TRPCError({
            code: "BAD_REQUEST",
            message: "Token is missing",
          }),
          INVALID_TOKEN: new TRPCError({
            code: "BAD_REQUEST",
            message: "Invalid token",
          }),
          EXPIRED_TOKEN: new TRPCError({
            code: "BAD_REQUEST",
            message: "Token has expired",
          }),
          EMAIL_NOT_EXIST: new TRPCError({
            code: "NOT_FOUND",
            message: "Email not found",
          }),
        };

        const error = res.error ? errorMap[res.error] : undefined;

        if (error) {
          throw error;
        } else {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "An unexpected error occurred",
          });
        }
      }

      return {
        success: true,
        message: res.message,
      };
    }),
});
