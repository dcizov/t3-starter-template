import type { z } from "zod";
import type {
  createUserSchema,
  deleteUserSchema,
  getUserByEmailSchema,
  getUserByIdSchema,
  getUserByNameSchema,
  updateUserSchema,
} from "@/schemas/user";
import { createCaller } from "@/server/api/root";
import { createTRPCContext } from "@/server/api/trpc";

async function createTrpcCaller() {
  const trpcContext = await createTRPCContext({ headers: new Headers() });
  return createCaller(trpcContext);
}

export async function getUserByEmail(
  input: z.infer<typeof getUserByEmailSchema>,
) {
  const trpc = await createTrpcCaller();
  return trpc.user.getByEmail(input);
}

export async function getUserById(input: z.infer<typeof getUserByIdSchema>) {
  const trpc = await createTrpcCaller();
  return trpc.user.getById(input);
}

export async function getByName(input: z.infer<typeof getUserByNameSchema>) {
  const trpc = await createTrpcCaller();
  return trpc.user.getByName(input);
}

export async function createUser(input: z.infer<typeof createUserSchema>) {
  const trpc = await createTrpcCaller();
  return trpc.user.create(input);
}

export async function updateUser(input: z.infer<typeof updateUserSchema>) {
  const trpc = await createTrpcCaller();
  return trpc.user.update(input);
}

export async function deleteUser(input: z.infer<typeof deleteUserSchema>) {
  const trpc = await createTrpcCaller();
  return trpc.user.delete(input);
}
