import { NextResponse, type NextRequest } from "next/server";
import { type Session } from "next-auth";
import {
  DEFAULT_LOGIN_REDIRECT,
  apiAuthPrefix,
  trpcPrefix,
  authRoutes,
  publicRoutes,
} from "@/lib/routes";

export async function middleware(req: NextRequest) {
  const { nextUrl } = req;

  const AUTH_URL = process.env.AUTH_URL;
  if (!AUTH_URL) {
    throw new Error("AUTH_URL is not defined in the environment variables");
  }

  const resSession = await fetch(`${AUTH_URL}/api/auth/session`, {
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
    return new NextResponse("Internal Server Error", { status: 500 });
  }

  const isAuthorized = session?.user?.id != null;

  const isApiAuthRoute = nextUrl.pathname.startsWith(apiAuthPrefix);
  const isTrpcRoute = nextUrl.pathname.startsWith(trpcPrefix);
  const isPublicRoute = publicRoutes.includes(nextUrl.pathname);
  const isAuthRoute = authRoutes.includes(nextUrl.pathname);

  if (isApiAuthRoute || isTrpcRoute) {
    return NextResponse.next();
  }

  if (isAuthRoute) {
    if (isAuthorized) {
      return NextResponse.redirect(new URL(DEFAULT_LOGIN_REDIRECT, nextUrl));
    }
    return NextResponse.next();
  }

  if (!isAuthorized && !isPublicRoute) {
    const callbackUrl = nextUrl.pathname + nextUrl.search;
    const encodedCallbackUrl = encodeURIComponent(callbackUrl);
    return NextResponse.redirect(
      new URL(`/signin?callbackUrl=${encodedCallbackUrl}`, nextUrl),
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
