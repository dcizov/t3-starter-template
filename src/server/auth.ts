import { DrizzleAdapter } from "@auth/drizzle-adapter";
import NextAuth, { type DefaultSession } from "next-auth";
import { type Adapter } from "next-auth/adapters";
import Google, { type GoogleProfile } from "next-auth/providers/google";
import Github, { type GitHubProfile } from "next-auth/providers/github";
import Credentials from "next-auth/providers/credentials";
import { db } from "@/server/db";
import {
  accounts,
  sessions,
  users,
  verificationTokens,
} from "@/server/db/schema";
import { cookies } from "next/headers";
import { getUserRole } from "@/lib/utils";
import { encode, decode } from "next-auth/jwt";
import { updateUser } from "@/lib/user-utils";
import { createSession, loginUser } from "@/lib/auth-utils";

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
    } & DefaultSession["user"];
  }

  interface User {
    id?: string;
    role: string;
    emailVerified?: Date;
  }
}

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://authjs.dev/reference/nextjs
 */
export const { auth, handlers, signIn, signOut } = NextAuth({
  callbacks: {
    async session({ session, user }) {
      return {
        ...session,
        user: {
          ...session.user,
          id: user.id,
          role: user.role,
        },
      };
    },
    async signIn({ user, account }) {
      if (
        account?.provider === "credentials" &&
        user.id &&
        user.emailVerified
      ) {
        try {
          const sessionCreated = await createSession({ userId: user.id });

          if (!sessionCreated.success) {
            return false;
          }

          return true;
        } catch (error) {
          console.error("Error creating session:", error);
          return false;
        }
      }

      return true;
    },
  },
  adapter: DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
    verificationTokensTable: verificationTokens,
  }) as Adapter,
  providers: [
    Github({
      profile(profile: GitHubProfile) {
        const [firstName, lastName] = (profile.name ?? "").split(" ");

        return {
          id: profile.id.toString(),
          email: profile.email,
          firstName: firstName ?? "",
          lastName: lastName ?? "",
          name: profile.name ?? profile.login,
          image: profile.avatar_url,
          role: getUserRole(profile.email ?? ""),
        };
      },
    }),
    Google({
      profile(profile: GoogleProfile) {
        return {
          id: profile.sub,
          email: profile.email,
          firstName: profile.given_name,
          lastName: profile.family_name,
          name: profile.name,
          image: profile.picture,
          role: getUserRole(profile.email),
        };
      },
    }),
    Credentials({
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        if (!credentials?.email || !credentials.password) return null;

        try {
          const res = await loginUser({
            email: credentials.email as string,
            password: credentials.password as string,
          });

          if (!res.success || !res.user) {
            return null;
          }

          return res.user;
        } catch (error) {
          console.error("Error authorizing credentials:", error);
          return null;
        }
      },
    }),
  ],
  events: {
    linkAccount: async ({ user }) => {
      if (!user.id) {
        console.error("User ID is undefined");
        return;
      }

      try {
        await updateUser({
          id: user.id,
          emailVerified: new Date(),
        });
      } catch (error) {
        console.error("Error linking account:", error);
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
});
