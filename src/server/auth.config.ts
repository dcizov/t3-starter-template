import type { NextAuthConfig } from "next-auth";
import Google, { type GoogleProfile } from "next-auth/providers/google";
import Github, { type GitHubProfile } from "next-auth/providers/github";
import Credentials from "next-auth/providers/credentials";
import { getUserRole } from "@/lib/utils";
import { loginUser } from "@/server/api/utils/auth/auth";
import { loginSchema } from "@/schemas/auth";

const authConfig: NextAuthConfig = {
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
        const { success, data } = loginSchema.safeParse(credentials);

        if (!success || !data.email || !data.password) return null;

        try {
          const result = await loginUser(undefined, data.email, data.password);

          return result.success && result.user?.emailVerified
            ? result.user
            : null;
        } catch (error) {
          console.error("Error authorizing credentials:", error);
          return null;
        }
      },
    }),
  ],
};

export default authConfig;
