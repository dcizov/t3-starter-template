import { DrizzleAdapter } from "@auth/drizzle-adapter";
import {
  getServerSession,
  type DefaultSession,
  type NextAuthOptions,
} from "next-auth";
import { type Adapter } from "next-auth/adapters";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { compareSync } from "bcrypt";
import { env } from "@/env";
import { db } from "@/server/db";
import {
  accounts,
  sessions,
  users,
  verificationTokens,
} from "@/server/db/schema";
import { cookies } from "next/headers";
import { randomUUID } from "crypto";
import { encode, decode } from "next-auth/jwt";

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
    } & DefaultSession["user"];
  }
}

// Session utilities
const generateSessionToken = () => {
  return randomUUID();
};

const fromDate = (time: number, date = Date.now()) => {
  return new Date(date + time * 1000);
};

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authOptions: NextAuthOptions = {
  callbacks: {
    session: async ({ session, user }) => {
      if (!user?.id) {
        console.error(
          "User object is missing or does not have a id property",
          user,
        );
        return session;
      }
      return {
        ...session,
        user: {
          ...session.user,
          id: user.id,
        },
      };
    },
    signIn: async ({ user, account }) => {
      if (account?.provider === "credentials") {
        if (!user.id) {
          console.error("User ID is undefined");
          return false;
        }

        const sessionToken = generateSessionToken();
        const sessionExpiry = fromDate(30 * 24 * 60 * 60);

        try {
          const createdSession = await db.insert(sessions).values({
            sessionToken: sessionToken,
            userId: user.id,
            expires: sessionExpiry,
          });

          if (!createdSession) return false;

          const cks = cookies();
          cks.set({
            name: "next-auth.session-token",
            value: sessionToken,
            expires: sessionExpiry,
          });

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
    GoogleProvider({
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    }),
    CredentialsProvider({
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        if (!credentials?.email || !credentials.password) return null;

        const user = await db.query.users.findFirst({
          where: (users, { eq }) => eq(users.email, credentials.email),
        });

        if (!user?.password) return null;

        const isPasswordValid = compareSync(
          credentials.password,
          user.password,
        );

        if (!isPasswordValid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
        };
      },
    }),
  ],
  pages: {
    signIn: "/signin",
    signOut: "/",
  },
  session: {
    strategy: "database",
  },
  jwt: {
    maxAge: 60 * 60 * 24 * 30,
    encode: async ({ token, secret, maxAge }) => {
      const cks = cookies();
      const cookie = cks?.get("next-auth.session-token");
      if (cookie) return cookie.value;
      return encode({
        token,
        secret,
        maxAge,
        salt: "next-auth.session-token",
      });
    },
    decode: async ({ token, secret }) => {
      return decode({
        token,
        secret,
        salt: "next-auth.session-token",
      });
    },
  },
};

/**
 * Wrapper for `getServerSession` so that you don't need to import the `authOptions` in every file.
 *
 * @see https://next-auth.js.org/configuration/nextjs
 */
export const getServerAuthSession = () => getServerSession(authOptions);
