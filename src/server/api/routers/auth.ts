import { randomUUID } from "crypto";
import { cookies } from "next/headers";
import { sessions, users, accounts } from "@/server/db/schema";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { hash, compare } from "bcrypt";
import { fromDate, getUserRole } from "@/lib/utils";
import {
  registerSchema,
  loginSchema,
  createSessionSchema,
} from "@/schemas/auth";

export const authRouter = createTRPCRouter({
  register: publicProcedure
    .input(registerSchema)
    .mutation(async ({ ctx, input }) => {
      const { firstName, lastName, email, password } = input;

      const existingUser = await ctx.db.query.users.findFirst({
        where: (users, { eq }) => eq(users.email, email),
      });

      if (existingUser) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "User already exists",
        });
      }

      const hashedPassword = await hash(password, 10);
      const fullName = `${firstName} ${lastName}`;

      const newUser = await ctx.db
        .insert(users)
        .values({
          firstName,
          lastName,
          name: fullName,
          email,
          password: hashedPassword,
          role: getUserRole(email),
        })
        .returning();

      if (newUser[0]) {
        await ctx.db.insert(accounts).values({
          userId: newUser[0].id,
          type: "email",
          provider: "credentials",
          providerAccountId: newUser[0].id,
        });

        return {
          success: true,
          message: "User registered successfully",
        };
      } else {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create user",
        });
      }
    }),

  login: publicProcedure.input(loginSchema).mutation(async ({ ctx, input }) => {
    const { email, password } = input;

    const user = await ctx.db.query.users.findFirst({
      where: (users, { eq }) => eq(users.email, email),
    });

    if (user?.password === null) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "User not found or password not set",
      });
    }

    if (!user) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "User not found",
      });
    }

    const isPasswordValid = await compare(password, user.password);

    if (!isPasswordValid) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Invalid password",
      });
    }

    return {
      success: true,
      message: "Login successful",
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }),

  createSession: publicProcedure
    .input(createSessionSchema)
    .mutation(async ({ ctx, input }) => {
      const sessionToken = randomUUID();
      const sessionExpiry = fromDate(60 * 60 * 24 * 30);

      const [createdSession] = await ctx.db
        .insert(sessions)
        .values({
          sessionToken,
          userId: input.userId,
          expires: sessionExpiry,
        })
        .returning();

      if (!createdSession) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create session",
        });
      }

      const cookieStore = cookies();
      cookieStore.set({
        name: "authjs.session-token",
        value: sessionToken,
        expires: sessionExpiry,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
      });

      return { success: true };
    }),
});
