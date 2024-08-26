import { eq } from "drizzle-orm";
import { users } from "@/server/db/schema";
import { type createTRPCContext } from "@/server/api/trpc";

type Context =
  ReturnType<typeof createTRPCContext> extends Promise<infer T> ? T : never;

export async function findUserByEmail(ctx: Context, email: string) {
  const user = await ctx.db.query.users.findFirst({
    where: (users, { eq }) => eq(users.email, email),
  });

  return user ?? null;
}

export async function findUserById(ctx: Context, id: string) {
  const user = await ctx.db.query.users.findFirst({
    where: (users, { eq }) => eq(users.id, id),
  });

  return user ?? null;
}

export async function findUsersByName(ctx: Context, name: string) {
  const usersByName = await ctx.db.query.users.findMany({
    where: (users, { like }) => like(users.name, `%${name}%`),
  });

  return usersByName;
}

export async function updateUserById(
  ctx: Context,
  id: string,
  updateData: Partial<{
    firstName: string;
    lastName: string;
    name: string;
    email: string;
    password: string;
    role: string;
  }>,
) {
  const updatedUser = await ctx.db
    .update(users)
    .set(updateData)
    .where(eq(users.id, id))
    .returning();

  return updatedUser[0] ?? null;
}

export async function deleteUserById(ctx: Context, id: string) {
  const result = await ctx.db.delete(users).where(eq(users.id, id)).returning();

  return result.length > 0;
}
