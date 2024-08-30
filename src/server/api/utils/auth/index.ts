// This index.ts file exports authentication-related utilities, including functions for user registration, login, email verification,
// password reset, and token management.
//
// From '@/server/api/utils/auth/auth':
// - registerUser: Registers a new user.
// - loginUser: Logs in a user by verifying credentials.
// - verifyEmailToken: Verifies an email token.
// - resetPassword: Initiates the password reset process.
// - setNewPassword: Resets a user's password using a reset token.
//
// From '@/server/api/utils/auth/password-reset-token':
// - generatePasswordResetToken: Generates a password reset token.
// - getPasswordResetTokenById: Retrieves a password reset token by ID.
// - getPasswordResetTokenByEmail: Retrieves a password reset token by email.
// - getPasswordResetTokenByToken: Retrieves a password reset token by token value.
// - deletePasswordResetToken: Deletes a password reset token by ID.
//
// From '@/server/api/utils/auth/verification-token':
// - generateVerificationToken: Generates a verification token.
// - getVerificationTokenById: Retrieves a verification token by ID.
// - getVerificationTokenByEmail: Retrieves a verification token by email.
// - getVerificationTokenByToken: Retrieves a verification token by token value.
// - deleteVerificationToken: Deletes a verification token by ID.

export * from "@/server/api/utils/auth/auth";
export * from "@/server/api/utils/auth/password-reset-token";
export * from "@/server/api/utils/auth/verification-token";
