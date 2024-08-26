import { randomUUID } from "crypto";
import { hash, compare } from "bcrypt";
import { accounts, sessions } from "@/server/db/schema";
import { fromDate, getUserRole } from "@/lib/utils";
import { generateVerificationToken } from "@/server/api/utils/token";
import { sendEmail } from "@/lib/mail";
import { type createTRPCContext } from "@/server/api/trpc";
import { cookies } from "next/headers";
import { findUserByEmail, updateUserById } from "@/server/api/utils/user";

type Context =
  ReturnType<typeof createTRPCContext> extends Promise<infer T> ? T : never;

/**
 * Registers a new user and returns the new user if successful, otherwise null.
 */
export async function registerUser(
  ctx: Context,
  firstName: string,
  lastName: string,
  email: string,
  password: string,
) {
  const existingUser = await findUserByEmail(ctx, email);

  if (existingUser) {
    return null;
  }

  const hashedPassword = await hash(password, 10);
  const fullName = `${firstName} ${lastName}`;

  const newUser = await updateUserById(ctx, randomUUID(), {
    firstName,
    lastName,
    name: fullName,
    email,
    password: hashedPassword,
    role: getUserRole(email),
  });

  if (newUser) {
    await ctx.db.insert(accounts).values({
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
 * Logs in a user by verifying their credentials and returns the user data if successful, otherwise null.
 */
export async function loginUser(ctx: Context, email: string, password: string) {
  const user = await findUserByEmail(ctx, email);

  if (user?.password === null) {
    return null;
  }

  if (!user?.emailVerified) {
    return null;
  }

  const isPasswordValid = await compare(password, user.password);

  if (!isPasswordValid) {
    return null;
  }

  return {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    name: user.name,
    email: user.email,
    role: user.role,
  };
}

/**
 * Creates a new session for the user and returns true if successful, otherwise false.
 */
export async function createSession(ctx: Context, userId: string) {
  const sessionToken = randomUUID();
  const sessionExpiry = fromDate(60 * 60 * 24 * 30); // 30 days

  const [createdSession] = await ctx.db
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
