import {
  deleteTwoFactorToken,
  generateTwoFactorToken,
  getTwoFactorTokenByEmail,
} from "@/server/api/utils/2fa/2fa-token";
import { sendTwoFactorEmail } from "@/lib/mail";
import { type createTRPCContext } from "@/server/api/trpc";
import {
  deleteTwoFactorConfirmation,
  generateTwoFactorConfirmation,
  getTwoFactorConfirmationByUserId,
} from "./2fa-confirmation";

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
  if (isTwoFactorEnabled && email) {
    if (code) {
      const twoFactorToken = await getTwoFactorTokenByEmail(ctx, email);

      if (!twoFactorToken) {
        return { error: "TOKEN_NOT_FOUND" };
      }

      if (twoFactorToken.token !== code) {
        return { error: "INVALID_TOKEN" };
      }

      const hasExpired = new Date(twoFactorToken.expires) < new Date();

      if (hasExpired) {
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
    } else {
      const twoFactorToken = await generateTwoFactorToken(ctx, email);

      if (twoFactorToken) {
        await sendTwoFactorEmail(twoFactorToken.email, twoFactorToken.token);
        return { twoFactor: true };
      } else {
        throw new Error("Failed to generate 2FA token");
      }
    }
  }

  return { twoFactor: false };
}
