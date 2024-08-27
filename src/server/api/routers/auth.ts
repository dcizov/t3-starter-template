import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import {
  registerSchema,
  loginSchema,
  createSessionSchema,
} from "@/schemas/auth";
import {
  registerUser,
  loginUser,
  createSession,
} from "@/server/api/utils/auth";

export const authRouter = createTRPCRouter({
  register: publicProcedure
    .input(registerSchema)
    .mutation(async ({ ctx, input }) => {
      const { firstName, lastName, email, password } = input;

      const newUser = await registerUser(
        ctx,
        firstName,
        lastName,
        email,
        password,
      );

      if (!newUser) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "User already exists or failed to create user",
        });
      }

      return {
        success: true,
        message: "User registered successfully",
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
});
