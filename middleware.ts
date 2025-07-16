import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "./lib/firebaseAdmin";

export async function middleware(request: NextRequest) {
  const session = request.cookies.get("session");
  const path = request.nextUrl.pathname;

  // Paths that don't require authentication
  const publicPaths = ["/login", "/register"];

  // Paths that require authentication
  const protectedPaths = ["/chat", "/profile"];

  // Check if the path is a dynamic chat route
  const isDynamicChatRoute = /^\/chat\/[^/]+$/.test(path);

  // If it's a public path, allow access
  if (publicPaths.includes(path)) {
    return NextResponse.next();
  }

  // If it's a protected path or dynamic chat route
  if (protectedPaths.includes(path) || isDynamicChatRoute) {
    // If no session exists, redirect to login
    if (!session) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    try {
      // Verify the session
      await auth.verifySessionCookie(session.value, true);
      return NextResponse.next();
    } catch (error) {
      // Invalid session, redirect to login
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  // For all other routes, proceed normally
  return NextResponse.next();
}

export const config = {
  matcher: ["/chat/:path*", "/profile"],
};
