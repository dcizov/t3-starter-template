import { hash, compare } from "bcrypt";
import { accounts, users } from "@/server/db/schema";
import { getUserRole } from "@/lib/utils";
import {
  generatePasswordResetToken,
  getPasswordResetTokenByToken,
  deletePasswordResetToken,
  generateVerificationToken,
  getVerificationTokenByToken,
  deleteVerificationToken,
} from "@/server/api/utils/auth";
import { sendPasswordResetEmail, sendVerificationEmail } from "@/lib/mail";
import { type createTRPCContext } from "@/server/api/trpc";
import { findUserByEmail, updateUserById } from "@/server/api/utils/user";
import { db } from "@/server/db";
import { eq } from "drizzle-orm";

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

  if (!newUser) {
    return null;
  }

  await dbInstance.insert(accounts).values({
    userId: newUser.id,
    type: "email",
    provider: "credentials",
    providerAccountId: newUser.id,
  });

  const verificationToken = await generateVerificationToken(ctx, email);
  const emailResult = verificationToken
    ? await sendVerificationEmail(
        verificationToken.email,
        verificationToken.token,
      )
    : { success: false };

  return { newUser, verificationEmailSent: emailResult.success };
}

/**
 * Logs in a user by verifying their credentials and returns the user data if successful.
 * If login fails, returns an object with error details.
 * @param ctx The database context (optional)
 * @param email The user's email address
 * @param password The password to verify
 * @returns An object with either user data and a success flag, or error information.
 */
export async function loginUser(
  ctx: Context | undefined,
  email: string,
  password: string,
) {
  const existingUser = await findUserByEmail(ctx, email);

  if (!existingUser) {
    return { success: false, error: "USER_NOT_FOUND" };
  }

  if (!existingUser.emailVerified) {
    return { success: false, error: "EMAIL_NOT_VERIFIED" };
  }

  if (!(await compare(password, existingUser.password!))) {
    return { success: false, error: "INVALID_CREDENTIALS" };
  }

  return {
    success: true,
    user: existingUser,
  };
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

  if (new Date(existingToken.expires) < new Date()) {
    await deleteVerificationToken(ctx, existingToken.id);
    return { success: false, error: "EXPIRED_TOKEN" };
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

  const passwordresetToken = await generatePasswordResetToken(ctx, email);
  const emailResult = passwordresetToken
    ? await sendPasswordResetEmail(
        passwordresetToken.email,
        passwordresetToken.token,
      )
    : { success: false };

  return {
    success: true,
    message: "Reset email sent!",
    passwordResetEmailSent: emailResult.success,
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

  if (new Date(existingToken.expires) < new Date()) {
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
