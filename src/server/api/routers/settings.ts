import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { updateSettingsSchema } from "@/schemas/settings";
import { updateSettings } from "@/server/api/utils/settings";

export const settingsRouter = createTRPCRouter({
  updateSettings: publicProcedure
    .input(updateSettingsSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, ...updateData } = input;

      if (!id) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "User ID is required",
        });
      }

      try {
        const updatedUserSettings = await updateSettings(ctx, id, updateData);

        return {
          success: true,
          message: "User updated successfully",
          user: updatedUserSettings,
        };
      } catch (error) {
        if (error instanceof Error) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: error.message || "Failed to update user",
          });
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update user",
        });
      }
    }),
});
