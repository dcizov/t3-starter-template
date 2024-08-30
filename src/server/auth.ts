import { DrizzleAdapter } from "@auth/drizzle-adapter";
import NextAuth, { type DefaultSession } from "next-auth";
import { type Adapter } from "next-auth/adapters";
import { db } from "@/server/db";
import {
  accounts,
  sessions,
  users,
  verificationTokens,
} from "@/server/db/schema";
import { cookies } from "next/headers";
import { encode, decode } from "next-auth/jwt";
import { updateUserById, findUserById } from "@/server/api/utils/user";
import { createSession } from "@/server/api/utils/session/session";
import authConfig from "@/server/auth.config";
import {
  deleteTwoFactorConfirmation,
  getTwoFactorConfirmationByUserId,
} from "@/server/api/utils/2fa/2fa-confirmation";

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://authjs.dev/getting-started/typescript#module-augmentation
 */
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      role: string;
      isTwoFactorEnabled: boolean;
      bio: string;
      firstName: string;
      lastName: string;
    } & DefaultSession["user"];
  }

  interface User {
    id?: string;
    role: string;
    emailVerified?: Date | null;
  }
}

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://authjs.dev/reference/nextjs
 */
export const { auth, handlers, signIn, signOut } = NextAuth({
  callbacks: {
    session: async ({ session, user }) => {
      return {
        ...session,
        user: {
          ...session.user,
          id: user.id,
          role: user.role,
        },
      };
    },
    signIn: async ({ user, account }) => {
      if (account?.provider === "credentials" && user?.id) {
        try {
          const existingUser = await findUserById(undefined, user.id);

          if (!existingUser?.emailVerified) return false;

          if (existingUser.isTwoFactorEnabled) {
            const twoFactorConfirmation =
              await getTwoFactorConfirmationByUserId(
                undefined,
                existingUser.id,
              );

            if (!twoFactorConfirmation) return false;

            await deleteTwoFactorConfirmation(
              undefined,
              twoFactorConfirmation.id,
            );
          }

          const sessionCreated = await createSession(undefined, user.id);
          return sessionCreated || false;
        } catch (error) {
          console.error("Error during signIn:", error);
          return false;
        }
      }

      return false;
    },
  },
  adapter: DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
    verificationTokensTable: verificationTokens,
  }) as Adapter,
  events: {
    linkAccount: async ({ user, account }) => {
      if (!user.id) {
        console.error("User ID is undefined");
        return;
      }

      if (account.provider !== "credentials") {
        try {
          await updateUserById(undefined, user.id, {
            emailVerified: new Date(),
          });
        } catch (error) {
          console.error("Error linking account:", error);
        }
      }
    },
  },
  pages: {
    signIn: "/signin",
    signOut: "/",
    error: "/error",
  },
  session: {
    strategy: "database",
  },
  jwt: {
    maxAge: 60 * 60 * 24 * 30,
    encode: async ({ token, secret, maxAge }) => {
      const cookieStore = cookies();
      const cookie = cookieStore.get("authjs.session-token");
      if (cookie) return cookie.value;
      return encode({
        token,
        secret,
        maxAge,
        salt: "authjs.session-token",
      });
    },
    decode: async ({ token, secret }) => {
      return decode({
        token,
        secret,
        salt: "authjs.session-token",
      });
    },
  },
  ...authConfig,
});
