import type { NextRequest } from "next/server";
import { type Session } from "next-auth";
import {
  DEFAULT_LOGIN_REDIRECT,
  apiAuthPrefix,
  authRoutes,
  publicRoutes,
} from "@/lib/routes";

export async function middleware(req: NextRequest) {
  const { nextUrl } = req;

  const resSession = await fetch(`${process.env.AUTH_URL}/api/auth/session`, {
    method: "GET",
    headers: {
      cookie: req.headers.get("cookie") ?? "",
    },
  });

  let session: Session | null = null;
  try {
    session = (await resSession.json()) as Session;
  } catch (error) {
    console.error("Failed to parse session:", error);
  }

  const isAuthorized = session?.user?.id != null;

  const isApiAuthRoute = nextUrl.pathname.startsWith(apiAuthPrefix);
  const isPublicRoute = publicRoutes.includes(nextUrl.pathname);
  const isAuthRoute = authRoutes.includes(nextUrl.pathname);

  if (isApiAuthRoute) {
    return null;
  }

  if (isAuthRoute) {
    if (isAuthorized) {
      return Response.redirect(new URL(DEFAULT_LOGIN_REDIRECT, nextUrl));
    }
    return null;
  }

  if (!isAuthorized && !isPublicRoute) {
    let callbackUrl = nextUrl.pathname;
    if (nextUrl.search) {
      callbackUrl += nextUrl.search;
    }
    const encodedCallbackUrl = encodeURIComponent(callbackUrl);
    return Response.redirect(
      new URL(`/signin?callbackUrl=${encodedCallbackUrl}`, nextUrl),
    );
  }

  return null;
}

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
