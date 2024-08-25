import type { z } from "zod";
import type {
  createUserSchema,
  deleteUserSchema,
  getUserByEmailSchema,
  getUserByIdSchema,
  getUserByNameSchema,
  updateUserSchema,
} from "@/schemas/user";
import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "@/server/api/root";
import { createCaller } from "@/server/api/root";
import { createTRPCContext } from "@/server/api/trpc";

type UserRouterOutput = inferRouterOutputs<AppRouter>["user"];

async function getTrpcCaller(
  contextProps: Partial<Parameters<typeof createTRPCContext>[0]> = {},
) {
  const context = await createTRPCContext({
    headers: contextProps.headers ?? new Headers(),
    ...contextProps,
  });
  return createCaller(context);
}

export async function getUserByEmail(
  input: z.infer<typeof getUserByEmailSchema>,
): Promise<UserRouterOutput["getByEmail"]> {
  const trpc = await getTrpcCaller();
  return trpc.user.getByEmail(input);
}

export async function getUserById(
  input: z.infer<typeof getUserByIdSchema>,
): Promise<UserRouterOutput["getById"]> {
  const trpc = await getTrpcCaller();
  return trpc.user.getById(input);
}

export async function getByName(
  input: z.infer<typeof getUserByNameSchema>,
): Promise<UserRouterOutput["getByName"]> {
  const trpc = await getTrpcCaller();
  return trpc.user.getByName(input);
}

export async function createUser(
  input: z.infer<typeof createUserSchema>,
): Promise<UserRouterOutput["create"]> {
  const trpc = await getTrpcCaller();
  return trpc.user.create(input);
}

export async function updateUser(
  input: z.infer<typeof updateUserSchema>,
): Promise<UserRouterOutput["update"]> {
  const trpc = await getTrpcCaller();
  return trpc.user.update(input);
}

export async function deleteUser(
  input: z.infer<typeof deleteUserSchema>,
): Promise<UserRouterOutput["delete"]> {
  const trpc = await getTrpcCaller();
  return trpc.user.delete(input);
}
