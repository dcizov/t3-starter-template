import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { eq } from "drizzle-orm";
import { users } from "@/server/db/schema";
import { TRPCError } from "@trpc/server";
import { hash } from "bcrypt";
import {
  createUserSchema,
  updateUserSchema,
  deleteUserSchema,
  getUserByEmailSchema,
  getUserByIdSchema,
  getUserByNameSchema,
} from "@/schemas/user";

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

  create: publicProcedure
    .input(createUserSchema)
    .mutation(async ({ ctx, input }) => {
      const { firstName, lastName, email, password, role } = input;

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
          role,
        })
        .returning();

      if (!newUser[0]) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create user",
        });
      }

      return {
        success: true,
        message: "User created successfully",
        user: newUser[0],
      };
    }),

  update: publicProcedure
    .input(updateUserSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, firstName, lastName, email, password, role } = input;

      const user = await ctx.db.query.users.findFirst({
        where: (users, { eq }) => eq(users.id, id),
      });

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

      const user = await ctx.db.query.users.findFirst({
        where: (users, { eq }) => eq(users.id, id),
      });

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
