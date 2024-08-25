import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { eq } from "drizzle-orm";
import { users } from "@/server/db/schema";
import { TRPCError } from "@trpc/server";
import { hash } from "bcrypt";
import {
  updateUserSchema,
  deleteUserSchema,
  getUserByEmailSchema,
  getUserByIdSchema,
  getUserByNameSchema,
} from "@/schemas/user";
import { registerSchema } from "@/schemas/auth";
import { registerUser } from "@/lib/auth-utils";
import { getUserRole } from "@/lib/utils";
import { getUserById } from "@/lib/user-utils";

export const userRouter = createTRPCRouter({
  getByEmail: publicProcedure
    .input(getUserByEmailSchema)
    .query(async ({ ctx, input }) => {
      const user = await ctx.db.query.users.findFirst({
        where: (users, { eq }) => eq(users.email, input.email),
      });

      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }

      return user;
    }),

  getById: publicProcedure
    .input(getUserByIdSchema)
    .query(async ({ ctx, input }) => {
      const user = await ctx.db.query.users.findFirst({
        where: (users, { eq }) => eq(users.id, input.id),
      });

      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }

      return user;
    }),

  getAll: publicProcedure.query(async ({ ctx }) => {
    const allUsers = await ctx.db.query.users.findMany();
    return allUsers;
  }),

  getByName: publicProcedure
    .input(getUserByNameSchema)
    .query(async ({ ctx, input }) => {
      const usersByName = await ctx.db.query.users.findMany({
        where: (users, { like }) => like(users.name, `%${input.name}%`),
      });

      if (usersByName.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "No users found with the given name",
        });
      }

      return usersByName;
    }),

  create: publicProcedure.input(registerSchema).mutation(async ({ input }) => {
    const { firstName, lastName, email, password } = input;

    const hashedPassword = await hash(password, 10);

    try {
      const user = await registerUser({
        firstName,
        lastName,
        email,
        password: hashedPassword,
        role: getUserRole(email),
      });

      if (!user.success) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: user.message || "Failed to create user",
        });
      }

      return {
        success: true,
        message: "User created successfully",
      };
    } catch (error) {
      console.error("Error in create procedure:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to create user",
      });
    }
  }),

  update: publicProcedure
    .input(updateUserSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, firstName, lastName, email, password, role } = input;

      const user = await getUserById({ id });

      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }

      const updateData: Partial<typeof input> = {};

      if (firstName) updateData.firstName = firstName;
      if (lastName) updateData.lastName = lastName;
      if (email) updateData.email = email;
      if (role) updateData.role = role;
      if (password) updateData.password = await hash(password, 10);

      const updatedUser = await ctx.db
        .update(users)
        .set(updateData)
        .where(eq(users.id, id))
        .returning();

      if (!updatedUser[0]) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update user",
        });
      }

      return {
        success: true,
        message: "User updated successfully",
        user: updatedUser[0],
      };
    }),

  delete: publicProcedure
    .input(deleteUserSchema)
    .mutation(async ({ ctx, input }) => {
      const { id } = input;

      const user = await getUserById({ id });

      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }

      await ctx.db.delete(users).where(eq(users.id, id));

      return {
        success: true,
        message: "User deleted successfully",
      };
    }),
});
