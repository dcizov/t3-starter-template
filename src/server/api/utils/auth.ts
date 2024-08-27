import { randomUUID } from "crypto";
import { hash, compare } from "bcrypt";
import { accounts, sessions, users } from "@/server/db/schema";
import { fromDate, getUserRole } from "@/lib/utils";
import {
  generateVerificationToken,
  getVerificationTokenByToken,
  deleteVerificationToken,
} from "@/server/api/utils/verification-token";
import { sendPasswordResetEmail, sendVerificationEmail } from "@/lib/mail";
import { type createTRPCContext } from "@/server/api/trpc";
import { cookies } from "next/headers";
import { findUserByEmail, updateUserById } from "@/server/api/utils/user";
import { db } from "@/server/db";
import { eq } from "drizzle-orm";
import {
  generatePasswordResetToken,
  getPasswordResetTokenByToken,
  deletePasswordResetToken,
} from "@/server/api/utils/password-reset-token";

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

    let verificationEmailSent = false;
    const verificationToken = await generateVerificationToken(ctx, email);
    if (verificationToken) {
      const emailResult = await sendVerificationEmail(
        verificationToken.email,
        verificationToken.token,
      );
      verificationEmailSent = emailResult.success;
    }

    return { newUser, verificationEmailSent };
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

/**
 * Verifies an email token and updates the user's email verification status.
 * @param ctx The database context (optional)
 * @param token The verification token to verify
 * @returns True if the token was successfully verified, otherwise false
 */
export async function verifyEmailToken(
  ctx: Context | undefined,
  token: string,
) {
  const dbInstance = ctx?.db ?? db;

  const existingToken = await getVerificationTokenByToken(ctx, token);

  if (!existingToken) {
    return { success: false, error: "INVALID_TOKEN" };
  }

  const hasExpired = new Date(existingToken.expires) < new Date();

  if (hasExpired) {
    await deleteVerificationToken(ctx, existingToken.id);
    return { success: false, error: "EXPIRED_TOKEN" };
  }

  const existingUser = await findUserByEmail(ctx, existingToken.email);

  if (!existingUser) {
    return { success: false, error: "EMAIL_NOT_EXIST" };
  }

  const [updatedUser] = await dbInstance
    .update(users)
    .set({ emailVerified: new Date(), email: existingToken.email })
    .where(eq(users.email, existingToken.email))
    .returning();

  if (!updatedUser) {
    return { success: false, error: "UPDATE_FAILED" };
  }

  await deleteVerificationToken(ctx, existingToken.id);

  return { success: true, message: "Email verified!" };
}

/**
 * Initiates the password reset process by sending a password reset email.
 * @param ctx The database context (optional)
 * @param email The user's email address
 * @returns An object indicating success or failure with an appropriate message.
 */
export async function resetPassword(ctx: Context | undefined, email: string) {
  const existingUser = await findUserByEmail(ctx, email);

  if (!existingUser) {
    return { success: false, error: "EMAIL_NOT_FOUND" };
  }

  let passwordResetEmailSent = false;
  const passwordresetToken = await generatePasswordResetToken(ctx, email);
  if (passwordresetToken) {
    const emailResult = await sendPasswordResetEmail(
      passwordresetToken.email,
      passwordresetToken.token,
    );
    passwordResetEmailSent = emailResult.success;
  }

  return {
    success: true,
    message: "Reset email sent!",
    passwordResetEmailSent,
  };
}

/**
 * Resets a user's password using a password reset token.
 * @param ctx The database context (optional)
 * @param token The password reset token to verify
 * @param password The new password to set for the user
 * @returns True if the password was successfully reset, otherwise false
 */
export async function setNewPassword(
  ctx: Context | undefined,
  password: string,
  token: string | null,
) {
  if (!token) {
    return { success: false, error: "MISSING_TOKEN" };
  }

  const existingToken = await getPasswordResetTokenByToken(ctx, token);
  if (!existingToken) {
    return { success: false, error: "INVALID_TOKEN" };
  }

  const hasExpired = new Date(existingToken.expires) < new Date();
  if (hasExpired) {
    return { success: false, error: "EXPIRED_TOKEN" };
  }

  const existingUser = await findUserByEmail(ctx, existingToken.email);
  if (!existingUser) {
    return { success: false, error: "EMAIL_NOT_EXIST" };
  }

  const hashedPassword = await hash(password, 10);

  await updateUserById(ctx, existingUser.id, { password: hashedPassword });

  await deletePasswordResetToken(ctx, existingToken.id);

  return { success: true, message: "Password updated!" };
}
