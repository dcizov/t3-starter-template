"use server";

import { signOut as nextAuthSignOut } from "@/server/auth";
import { cookies } from "next/headers";
import { deleteSession } from "@/server/api/utils/session/session";

export const signOut = async () => {
  const cookieStore = cookies();
  const sessionCookie = cookieStore.get("authjs.session-token");
  if (sessionCookie) {
    const sessionToken = sessionCookie.value;

    await deleteSession(undefined, sessionToken);
  }

  await nextAuthSignOut();
};
