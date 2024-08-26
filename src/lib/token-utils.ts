import { z } from "zod";
import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "@/server/api/root";
import { getTrpcCaller } from "@/lib/create-caller";

type TokenRouterOutput = inferRouterOutputs<AppRouter>["token"];

const getVerificationTokenByEmailSchema = z.object({
  email: z.string().email(),
});
const getVerificationTokenByTokenSchema = z.object({
  token: z.string().uuid(),
});
const getVerificationTokenByIdSchema = z.object({ id: z.string().uuid() });

export async function getVerificationTokenById(
  input: z.infer<typeof getVerificationTokenByIdSchema>,
): Promise<TokenRouterOutput["getVerificationTokenById"]> {
  const trpc = await getTrpcCaller();
  return trpc.token.getVerificationTokenById(input);
}

export async function getVerificationTokenByEmail(
  input: z.infer<typeof getVerificationTokenByEmailSchema>,
): Promise<TokenRouterOutput["getVerificationTokenByEmail"]> {
  const trpc = await getTrpcCaller();
  return trpc.token.getVerificationTokenByEmail(input);
}
export async function getVerificationTokenByToken(
  input: z.infer<typeof getVerificationTokenByTokenSchema>,
): Promise<TokenRouterOutput["getVerificationTokenByToken"]> {
  const trpc = await getTrpcCaller();
  return trpc.token.getVerificationTokenByToken(input);
}

export async function deleteVerificationToken(
  input: z.infer<typeof getVerificationTokenByIdSchema>,
): Promise<TokenRouterOutput["deleteVerificationToken"]> {
  const trpc = await getTrpcCaller();
  return trpc.token.deleteVerificationToken(input);
}
export async function generateVerificationToken(
  input: z.infer<typeof getVerificationTokenByEmailSchema>,
): Promise<TokenRouterOutput["generateVerificationToken"]> {
  const trpc = await getTrpcCaller();
  return trpc.token.generateVerificationToken(input);
}
