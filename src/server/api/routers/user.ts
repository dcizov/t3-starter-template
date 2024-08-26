import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
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
import {
  findUserByEmail,
  findUserById,
  findUsersByName,
  updateUserById,
  deleteUserById,
} from "@/server/api/utils/user";
import { registerUser } from "@/server/api/utils/auth";

export const userRouter = createTRPCRouter({
  getByEmail: publicProcedure
    .input(getUserByEmailSchema)
    .query(async ({ ctx, input }) => {
      const user = await findUserByEmail(ctx, input.email);
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
      const user = await findUserById(ctx, input.id);
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
      const users = await findUsersByName(ctx, input.name);
      if (users.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "No users found with the given name",
        });
      }

      return users;
    }),

  create: publicProcedure
    .input(registerSchema)
    .mutation(async ({ ctx, input }) => {
      const { firstName, lastName, email, password } = input;

      const user = await registerUser(
        ctx,
        firstName,
        lastName,
        email,
        password,
      );

      if (!user) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create user",
        });
      }

      return {
        success: true,
        message: "User created successfully",
        user: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
        },
      };
    }),

  update: publicProcedure
    .input(updateUserSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, firstName, lastName, email, password, role } = input;

      const user = await findUserById(ctx, id);
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

      const updatedUser = await updateUserById(ctx, id, updateData);

      if (!updatedUser) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update user",
        });
      }

      return {
        success: true,
        message: "User updated successfully",
        user: updatedUser,
      };
    }),

  delete: publicProcedure
    .input(deleteUserSchema)
    .mutation(async ({ ctx, input }) => {
      const user = await findUserById(ctx, input.id);
      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }

      const deleted = await deleteUserById(ctx, input.id);
      if (!deleted) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete user",
        });
      }

      return {
        success: true,
        message: "User deleted successfully",
      };
    }),
});
