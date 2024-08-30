import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { createSessionSchema, deleteSessionSchema } from "@/schemas/session";
import { createSession, deleteSession } from "@/server/api/utils/session";

export const sessionRouter = createTRPCRouter({
  createSession: publicProcedure
    .input(createSessionSchema)
    .mutation(async ({ ctx, input }) => {
      const { userId } = input;
      const success = await createSession(ctx, userId);

      if (!success) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create session",
        });
      }

      return { success: true };
    }),

  deleteSession: publicProcedure
    .input(deleteSessionSchema)
    .mutation(async ({ ctx, input }) => {
      const { sessionToken } = input;
      const success = await deleteSession(ctx, sessionToken);

      if (!success) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete session",
        });
      }

      return { success: true };
    }),
});
