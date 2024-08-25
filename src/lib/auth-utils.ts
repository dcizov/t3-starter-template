import type { z } from "zod";
import type { createSessionSchema } from "@/schemas/auth";
import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "@/server/api/root";
import { getTrpcCaller } from "@/lib/create-caller";

type AuthRouterOutput = inferRouterOutputs<AppRouter>["auth"];

export async function createSession(
  input: z.infer<typeof createSessionSchema>,
): Promise<AuthRouterOutput["createSession"]> {
  const trpc = await getTrpcCaller();
  try {
    const response = await trpc.auth.createSession(input);
    return response;
  } catch (error) {
    console.error("Error creating session in auth utility:", error);
    return { success: false };
  }
}
