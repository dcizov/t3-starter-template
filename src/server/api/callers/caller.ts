import { createCaller } from "@/server/api/root";
import { createTRPCContext } from "@/server/api/trpc";

/**
 * Function to get a TRPC caller with an optional context.
 * @param contextProps - Optional partial context properties.
 * @returns A TRPC caller with the provided or default context.
 */
export async function getTrpcCaller(
  contextProps: Partial<Parameters<typeof createTRPCContext>[0]> = {},
) {
  const context = await createTRPCContext({
    headers: contextProps.headers ?? new Headers(),
    ...contextProps,
  });
  return createCaller(context);
}
