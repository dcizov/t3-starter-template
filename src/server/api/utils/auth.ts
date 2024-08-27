import { randomUUID } from "crypto";
import { hash, compare } from "bcrypt";
import { accounts, sessions, users } from "@/server/db/schema";
import { fromDate, getUserRole } from "@/lib/utils";
import { generateVerificationToken } from "@/server/api/utils/token";
import { sendEmail } from "@/lib/mail";
import { type createTRPCContext } from "@/server/api/trpc";
import { cookies } from "next/headers";
import { findUserByEmail } from "@/server/api/utils/user";
import { db } from "@/server/db";

type Context =
  ReturnType<typeof createTRPCContext> extends Promise<infer T> ? T : never;

/**
 * Registers a new user and returns the new user if successful, otherwise null.
 * @param ctx The database context (optional)
 * @param firstName The user's first name
 * @param lastName The user's last name
 * @param email The user's email address
 * @param password The user's password (will be hashed)
 * @returns The newly created user object if successful, otherwise null
 */
export async function registerUser(
  ctx: Context | undefined,
  firstName: string,
  lastName: string,
  email: string,
  password: string,
) {
  const dbInstance = ctx?.db ?? db;

  const existingUser = await findUserByEmail(ctx, email);

  if (existingUser) {
    return null;
  }

  const hashedPassword = await hash(password, 10);
  const fullName = `${firstName} ${lastName}`;

  const [newUser] = await dbInstance
    .insert(users)
    .values({
      firstName,
      lastName,
      name: fullName,
      email,
      password: hashedPassword,
      role: getUserRole(email),
      emailVerified: null,
    })
    .returning();

  if (newUser) {
    await dbInstance.insert(accounts).values({
      userId: newUser.id,
      type: "email",
      provider: "credentials",
      providerAccountId: newUser.id,
    });

    const verificationToken = await generateVerificationToken(ctx, email);
    if (verificationToken) {
      await sendEmail(verificationToken.email, verificationToken.token);
    }

    return newUser;
  } else {
    return null;
  }
}

/**
 * Logs in a user by verifying their credentials and returns the user data if successful.
 * If login fails, returns an object with error details.
 * @param ctx The database context (optional)
 * @param email The user's email address
 * @param password The password to verify
 * @returns An object with either user data or error information.
 */
export async function loginUser(
  ctx: Context | undefined,
  email: string,
  password: string,
) {
  const user = await findUserByEmail(ctx, email);

  if (!user) {
    return { success: false, error: "USER_NOT_FOUND" };
  }

  if (!user.emailVerified) {
    return { success: false, error: "EMAIL_NOT_VERIFIED" };
  }

  const isPasswordValid = await compare(password, user.password!);

  if (!isPasswordValid) {
    return { success: false, error: "INVALID_CREDENTIALS" };
  }

  return {
    success: true,
    user: {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      name: user.name,
      email: user.email,
      role: user.role,
      emailVerified: user.emailVerified,
    },
  };
}

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
      userId: userId,
      expires: sessionExpiry,
    })
    .returning();

  if (!createdSession) {
    return false;
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

  return true;
}
