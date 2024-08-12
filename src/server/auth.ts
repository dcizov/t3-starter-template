import { DrizzleAdapter } from "@auth/drizzle-adapter";
import NextAuth, { type DefaultSession } from "next-auth";
import { type Adapter } from "next-auth/adapters";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { compareSync } from "bcrypt";
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
 * @see https://authjs.dev/getting-started/typescript#module-augmentation
 */
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
    } & DefaultSession["user"];
  }
}

const generateSessionToken = () => randomUUID();

const fromDate = (time: number, date = Date.now()) =>
  new Date(date + time * 1000);

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://authjs.dev/reference/nextjs
 */
export const { auth, handlers, signIn, signOut } = NextAuth({
  callbacks: {
    session: async ({ session, user }) => ({
      ...session,
      user: {
        ...session.user,
        id: user.id,
      },
    }),
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

          const cookieStore = cookies();
          cookieStore.set({
            name: "authjs.session-token",
            value: sessionToken,
            expires: sessionExpiry,
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
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
    Google,
    Credentials({
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        if (!credentials?.email || !credentials.password) return null;

        const user = await db.query.users.findFirst({
          where: (users, { eq }) =>
            eq(users.email, credentials.email as string),
        });

        if (!user?.password) return null;

        const isPasswordValid = compareSync(
          credentials.password as string,
          user.password,
        );

        if (!isPasswordValid) return null;

        return {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
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
