import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const session = req.cookies.get("session")?.value;

  if (pathname.startsWith("/chat") && !session) {
    const loginUrl = req.nextUrl.clone();
    loginUrl.pathname = "/login";
    const response = NextResponse.redirect(loginUrl);
    applySecurityHeaders(response);
    return response;
  }

  if ((pathname === "/login" || pathname === "/register") && session) {
    const chatUrl = req.nextUrl.clone();
    chatUrl.pathname = "/chat";
    const response = NextResponse.redirect(chatUrl);
    applySecurityHeaders(response);
    return response;
  }

  const response = NextResponse.next();
  applySecurityHeaders(response);
  return response;
}

function applySecurityHeaders(res: NextResponse) {
  res.headers.set("Cross-Origin-Opener-Policy", "same-origin");
  res.headers.set("Cross-Origin-Embedder-Policy", "require-corp");
}

export const config = {
  matcher: ["/chat/:path*", "/login", "/register"],
};
