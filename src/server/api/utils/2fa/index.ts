// This index.ts file exports 2FA-related utilities, including token generation,
// validation, and confirmation management functions.
//
// From '@/server/api/utils/2fa/2fa':
// - handleTwoFactorAuthentication: Manages the 2FA process, generates tokens, sends emails, and validates tokens.
//
// From '@/server/api/utils/2fa/2fa-token':
// - generateTwoFactorToken: Creates a 2FA token for an email.
// - getTwoFactorTokenByEmail: Fetches a 2FA token by email.
// - getTwoFactorTokenById: Fetches a 2FA token by ID.
// - getTwoFactorTokenByToken: Fetches a 2FA token by token value.
// - deleteTwoFactorToken: Removes a 2FA token by ID.
//
// From '@/server/api/utils/2fa/2fa-confirmation':
// - generateTwoFactorConfirmation: Creates a 2FA confirmation for a user ID.
// - getTwoFactorConfirmationByUserId: Fetches a 2FA confirmation by user ID.
// - deleteTwoFactorConfirmation: Removes a 2FA confirmation by ID.

export * from "@/server/api/utils/2fa/2fa";
export * from "@/server/api/utils/2fa/2fa-token";
export * from "@/server/api/utils/2fa/2fa-confirmation";
