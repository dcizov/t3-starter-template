import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { users, accounts } from "@/server/db/schema";
import { TRPCError } from "@trpc/server";
import { hash, compare } from "bcrypt";
import { registerSchema, loginSchema } from "@/common/validation/auth";

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
        })
        .returning();

      if (newUser[0]) {
        await ctx.db.insert(accounts).values({
          userId: newUser[0].id,
          type: "email",
          provider: "credentials",
          providerAccountId: newUser[0].id,
        });

        return { success: true, message: "User registered successfully" };
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

    // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
    if (!user || user.password === null) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "User not found or password not set",
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
      },
    };
  }),
});
