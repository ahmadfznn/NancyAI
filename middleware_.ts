import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const session = request.cookies.get("session");
  const path = request.nextUrl.pathname;

  const publicPaths = ["/login", "/register"];
  const protectedPaths = ["/chat", "/profile"];
  const isDynamicChatRoute = /^\/chat\/[^/]+$/.test(path);

  const requiresAuth = protectedPaths.includes(path) || isDynamicChatRoute;

  if (publicPaths.includes(path)) {
    return NextResponse.next();
  }

  if (requiresAuth && !session) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/chat/:path*", "/profile"],
};
