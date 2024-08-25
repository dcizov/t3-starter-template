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
import { getTrpcCaller } from "@/lib/create-caller";

type UserRouterOutput = inferRouterOutputs<AppRouter>["user"];

/**
 * Function to get a user by email via TRPC.
 * @param input - The input data for getting a user by email.
 * @returns The output of the getByEmail TRPC procedure.
 */
export async function getUserByEmail(
  input: z.infer<typeof getUserByEmailSchema>,
): Promise<UserRouterOutput["getByEmail"]> {
  const trpc = await getTrpcCaller();
  return trpc.user.getByEmail(input);
}

/**
 * Function to get a user by ID via TRPC.
 * @param input - The input data for getting a user by ID.
 * @returns The output of the getById TRPC procedure.
 */
export async function getUserById(
  input: z.infer<typeof getUserByIdSchema>,
): Promise<UserRouterOutput["getById"]> {
  const trpc = await getTrpcCaller();
  return trpc.user.getById(input);
}

/**
 * Function to get users by name via TRPC.
 * @param input - The input data for getting users by name.
 * @returns The output of the getByName TRPC procedure.
 */
export async function getByName(
  input: z.infer<typeof getUserByNameSchema>,
): Promise<UserRouterOutput["getByName"]> {
  const trpc = await getTrpcCaller();
  return trpc.user.getByName(input);
}

/**
 * Function to create a user via TRPC.
 * @param input - The input data for creating a user.
 * @returns The output of the create TRPC procedure.
 */
export async function createUser(
  input: z.infer<typeof createUserSchema>,
): Promise<UserRouterOutput["create"]> {
  const trpc = await getTrpcCaller();
  return trpc.user.create(input);
}

/**
 * Function to update a user via TRPC.
 * @param input - The input data for updating a user.
 * @returns The output of the update TRPC procedure.
 */
export async function updateUser(
  input: z.infer<typeof updateUserSchema>,
): Promise<UserRouterOutput["update"]> {
  const trpc = await getTrpcCaller();
  return trpc.user.update(input);
}

/**
 * Function to delete a user via TRPC.
 * @param input - The input data for deleting a user.
 * @returns The output of the delete TRPC procedure.
 */
export async function deleteUser(
  input: z.infer<typeof deleteUserSchema>,
): Promise<UserRouterOutput["delete"]> {
  const trpc = await getTrpcCaller();
  return trpc.user.delete(input);
}
