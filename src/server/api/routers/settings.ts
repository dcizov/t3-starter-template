import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { updateSettingsSchema } from "@/schemas/settings";
import { updateSettings } from "@/server/api/utils/settings";

export const settingsRouter = createTRPCRouter({
  updateSettings: publicProcedure
    .input(updateSettingsSchema)
    .mutation(async ({ ctx, input }) => {
      const {
        id,
        firstName,
        lastName,
        email,
        currentPassword,
        newPassword,
        confirmNewPassword,
        bio,
        two_factor,
      } = input;

      try {
        const updatedUserSettings = await updateSettings(ctx, id, {
          firstName,
          lastName,
          email,
          currentPassword,
          newPassword,
          confirmNewPassword,
          bio,
          two_factor,
        });

        return {
          success: true,
          message: "User updated successfully",
          user: updatedUserSettings,
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update user",
        });
      }
    }),
});
