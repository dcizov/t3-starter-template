import { hash, compare } from "bcrypt";
import { type createTRPCContext } from "@/server/api/trpc";
import { findUserById, updateUserById } from "@/server/api/utils/user";

type Context =
  ReturnType<typeof createTRPCContext> extends Promise<infer T> ? T : never;

interface UserData {
  firstName?: string;
  lastName?: string;
  name?: string;
  email?: string;
  currentPassword?: string;
  newPassword?: string;
  confirmNewPassword?: string;
  role?: string;
  emailVerified?: Date;
  bio?: string;
  two_factor?: boolean;
}

/**
 * Updates settings
 * @param ctx The database context (optional)
 * @param id The ID of the user to update
 * @param updateData An object containing the fields to update
 * @returns The updated user if successful, otherwise null
 */
export async function updateSettings(
  ctx: Context | undefined,
  id: string,
  updateData: UserData,
) {
  const user = await findUserById(ctx, id);

  if (!user) {
    throw new Error("User not found");
  }

  const { currentPassword, newPassword, confirmNewPassword, ...otherData } =
    updateData;

  const hashedPassword =
    currentPassword && newPassword && confirmNewPassword
      ? await handlePasswordUpdate(
          currentPassword,
          newPassword,
          confirmNewPassword,
          user.password!,
        )
      : undefined;

  const updateUserValues = {
    ...otherData,
    ...(hashedPassword ? { password: hashedPassword } : {}),
  };

  const updatedUser = await updateUserById(ctx, user.id, updateUserValues);
  return updatedUser ?? null;
}

async function handlePasswordUpdate(
  currentPassword: string,
  newPassword: string,
  confirmNewPassword: string,
  userPassword: string,
): Promise<string> {
  const isPasswordValid = await compare(currentPassword, userPassword);
  if (!isPasswordValid) {
    throw new Error("Current password is incorrect");
  }

  if (newPassword !== confirmNewPassword) {
    throw new Error("New password and confirm new password do not match");
  }

  return hash(newPassword, 10);
}
