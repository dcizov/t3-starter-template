import type { z } from "zod";
import type {
  createSessionSchema,
  registerSchema,
  loginSchema,
} from "@/schemas/auth";
import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "@/server/api/root";
import { getTrpcCaller } from "@/lib/create-caller";

type AuthRouterOutput = inferRouterOutputs<AppRouter>["auth"];

/**
 * Function to handle session creation via TRPC.
 * @param input - The input data for session creation.
 * @returns The output of the createSession TRPC procedure.
 */
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

/**
 * Function to handle user registration via TRPC.
 * @param input - The input data for user registration.
 * @returns The output of the register TRPC procedure.
 */
export async function registerUser(
  input: z.infer<typeof registerSchema>,
): Promise<AuthRouterOutput["register"]> {
  const trpc = await getTrpcCaller();
  try {
    const response = await trpc.auth.register(input);
    return response;
  } catch (error) {
    console.error("Error registering user in auth utility:", error);
    return {
      success: false,
      message: "User registration failed",
    };
  }
}

/**
 * Function to handle user login via TRPC.
 * @param input - The input data for user login.
 * @returns The output of the login TRPC procedure.
 */
export async function loginUser(
  input: z.infer<typeof loginSchema>,
): Promise<AuthRouterOutput["login"]> {
  const trpc = await getTrpcCaller();
  try {
    const response = await trpc.auth.login(input);
    return response;
  } catch (error) {
    console.error("Error logging in user in auth utility:", error);
    return {
      success: false,
      message: "User login failed",
      user: {
        id: "",
        firstName: "",
        lastName: "",
        name: null,
        email: "",
        role: "",
      },
    };
  }
}
