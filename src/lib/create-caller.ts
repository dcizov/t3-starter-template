import { createCaller } from "@/server/api/root";
import { createTRPCContext } from "@/server/api/trpc";

export async function getTrpcCaller(
  contextProps: Partial<Parameters<typeof createTRPCContext>[0]> = {},
) {
  const context = await createTRPCContext({
    headers: contextProps.headers ?? new Headers(),
    ...contextProps,
  });
  return createCaller(context);
}
