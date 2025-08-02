// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const session = request.cookies.get("session");
  const path = request.nextUrl.pathname;

  const publicPaths = ["/login", "/register"];
  const protectedPaths = ["/chat", "/profile"];
  const isDynamicChatRoute = /^\/chat\/[^/]+$/.test(path);

  if (publicPaths.includes(path)) {
    return NextResponse.next();
  }

  if (protectedPaths.includes(path) || isDynamicChatRoute) {
    if (!session) {
      console.log(
        "Middleware: No session cookie found, redirecting to login for protected path:",
        path
      );
      return NextResponse.redirect(new URL("/login", request.url));
    }

    try {
      const verifySessionApiUrl = new URL(
        "/api/verify",
        request.url
      ).toString();
      console.log(
        "Middleware: Calling internal /api/verify-session:",
        verifySessionApiUrl
      );

      const verifyResponse = await fetch(verifySessionApiUrl, {
        headers: {
          Cookie: `session=${session.value}`,
        },
      });

      if (!verifyResponse.ok) {
        console.log(
          "Middleware: Internal API session verification failed (status not OK)."
        );
        return NextResponse.redirect(new URL("/login", request.url));
      }

      console.log(
        "Middleware: Session verified successfully by API route for path:",
        path
      );
      return NextResponse.next();
    } catch (error) {
      console.error(
        "Middleware: Error during internal API session verification fetch:",
        error
      );
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/chat/:path*", "/profile"],
};
