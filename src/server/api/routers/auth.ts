import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import {
  registerSchema,
  loginSchema,
  createSessionSchema,
} from "@/schemas/auth";
import {
  registerUser,
  loginUser,
  createSession,
  verifyEmailToken,
} from "@/server/api/utils/auth";

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
    const { email, password } = input;

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

    return {
      success: true,
      message: "Login successful",
      user: res.user,
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
      console.log(res);

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
});
