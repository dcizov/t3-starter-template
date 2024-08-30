import {
  deleteTwoFactorToken,
  generateTwoFactorToken,
  getTwoFactorTokenByEmail,
  deleteTwoFactorConfirmation,
  generateTwoFactorConfirmation,
  getTwoFactorConfirmationByUserId,
} from "@/server/api/utils/2fa";
import { sendTwoFactorEmail } from "@/lib/mail";
import { type createTRPCContext } from "@/server/api/trpc";

type Context =
  ReturnType<typeof createTRPCContext> extends Promise<infer T> ? T : never;

/**
 * Handles the two-factor authentication process for a user.
 * Generates a 2FA token and sends it to the user's email.
 * @param ctx The database context
 * @param email The user's email address
 * @param isTwoFactorEnabled A flag indicating if 2FA is enabled for the user
 * @returns An object indicating whether the 2FA email was sent
 * @throws An error if the 2FA token generation or email sending fails
 */
export async function handleTwoFactorAuthentication(
  ctx: Context,
  userId: string,
  email: string,
  isTwoFactorEnabled: boolean,
  code?: string,
) {
  if (!isTwoFactorEnabled || !email) {
    return { twoFactor: false };
  }

  if (code) {
    const twoFactorToken = await getTwoFactorTokenByEmail(ctx, email);

    if (!twoFactorToken) {
      return { error: "TOKEN_NOT_FOUND" };
    }

    if (twoFactorToken.token !== code) {
      return { error: "INVALID_TOKEN" };
    }

    if (new Date(twoFactorToken.expires) < new Date()) {
      return { error: "TOKEN_EXPIRED" };
    }

    await deleteTwoFactorToken(ctx, twoFactorToken.id);

    const existingConfirmation = await getTwoFactorConfirmationByUserId(
      ctx,
      userId,
    );
    if (existingConfirmation) {
      await deleteTwoFactorConfirmation(ctx, existingConfirmation.id);
    }

    await generateTwoFactorConfirmation(ctx, userId);
    return { twoFactor: false };
  }

  const twoFactorToken = await generateTwoFactorToken(ctx, email);
  if (!twoFactorToken) {
    throw new Error("Failed to generate 2FA token");
  }

  await sendTwoFactorEmail(twoFactorToken.email, twoFactorToken.token);
  return { twoFactor: true };
}
