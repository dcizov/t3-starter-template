import { eq } from "drizzle-orm";
import { users } from "@/server/db/schema";
import { type createTRPCContext } from "@/server/api/trpc";
import { db } from "@/server/db";

type Context =
  ReturnType<typeof createTRPCContext> extends Promise<infer T> ? T : never;

/**
 * Finds a user by their email address.
 * @param ctx The database context (optional)
 * @param email The email address to search for
 * @returns The user if found, otherwise null
 */
export async function findUserByEmail(ctx: Context | undefined, email: string) {
  const dbInstance = ctx?.db ?? db;

  const user = await dbInstance.query.users.findFirst({
    where: (users, { eq }) => eq(users.email, email),
  });

  return user ?? null;
}

/**
 * Finds a user by their ID.
 * @param ctx The database context (optional)
 * @param id The ID of the user to find
 * @returns The user if found, otherwise null
 */
export async function findUserById(ctx: Context | undefined, id: string) {
  const dbInstance = ctx?.db ?? db;

  const user = await dbInstance.query.users.findFirst({
    where: (users, { eq }) => eq(users.id, id),
  });

  return user ?? null;
}

/**
 * Finds users by their name (partial match).
 * @param ctx The database context (optional)
 * @param name The name to search for
 * @returns An array of users matching the name
 */
export async function findUsersByName(ctx: Context | undefined, name: string) {
  const dbInstance = ctx?.db ?? db;

  const usersByName = await dbInstance.query.users.findMany({
    where: (users, { like }) => like(users.name, `%${name}%`),
  });

  return usersByName;
}

/**
 * Updates a user by their ID.
 * @param ctx The database context (optional)
 * @param id The ID of the user to update
 * @param updateData An object containing the fields to update
 * @returns The updated user if successful, otherwise null
 */
export async function updateUserById(
  ctx: Context | undefined,
  id: string,
  updateData: Partial<{
    firstName: string;
    lastName: string;
    name: string;
    email: string;
    password: string;
    role: string;
    emailVerified: Date;
  }>,
) {
  const dbInstance = ctx?.db ?? db;

  const updatedUser = await dbInstance
    .update(users)
    .set(updateData)
    .where(eq(users.id, id))
    .returning();

  return updatedUser[0] ?? null;
}

/**
 * Deletes a user by their ID.
 * @param ctx The database context (optional)
 * @param id The ID of the user to delete
 * @returns True if the user was successfully deleted, false otherwise
 */
export async function deleteUserById(ctx: Context | undefined, id: string) {
  const dbInstance = ctx?.db ?? db;

  const result = await dbInstance
    .delete(users)
    .where(eq(users.id, id))
    .returning();

  return result.length > 0;
}
