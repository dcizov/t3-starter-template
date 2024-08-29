import { randomUUID } from "crypto";
import { sessions } from "@/server/db/schema";
import { fromDate } from "@/lib/utils";
import { cookies } from "next/headers";
import { db } from "@/server/db";
import { eq } from "drizzle-orm";
import { type createTRPCContext } from "@/server/api/trpc";

type Context =
  ReturnType<typeof createTRPCContext> extends Promise<infer T> ? T : never;

/**
 * Creates a new session for the user and sets a session cookie.
 * @param ctx The database context (optional)
 * @param userId The ID of the user to create a session for
 * @returns True if the session was successfully created, otherwise false
 */
export async function createSession(ctx: Context | undefined, userId: string) {
  const dbInstance = ctx?.db ?? db;
  const sessionToken = randomUUID();
  const sessionExpiry = fromDate(60 * 60 * 24 * 30);

  const [createdSession] = await dbInstance
    .insert(sessions)
    .values({
      sessionToken,
      userId,
      expires: sessionExpiry,
    })
    .returning();

  if (!createdSession) {
    return false;
  }

  cookies().set({
    name: "authjs.session-token",
    value: sessionToken,
    expires: sessionExpiry,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });

  return true;
}

/**
 * Deletes a session and clears the session cookie.
 * @param ctx The database context (optional)
 * @param sessionToken The session token to delete
 * @returns True if the session was successfully deleted, otherwise false
 */
export async function deleteSession(
  ctx: Context | undefined,
  sessionToken: string,
) {
  const dbInstance = ctx?.db ?? db;

  const [deletedSession] = await dbInstance
    .delete(sessions)
    .where(eq(sessions.sessionToken, sessionToken))
    .returning();

  if (!deletedSession) {
    return false;
  }

  cookies().set({
    name: "authjs.session-token",
    value: "",
    expires: new Date(0),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });

  return true;
}
