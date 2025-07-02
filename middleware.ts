import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const session = req.cookies.get("session")?.value;

  if (pathname.startsWith("/chat") && !session) {
    const loginUrl = req.nextUrl.clone();
    loginUrl.pathname = "/login";
    return NextResponse.redirect(loginUrl);
  }

  // if ((pathname === "/login" || pathname === "/register") && session) {
  //   const chatUrl = req.nextUrl.clone();
  //   chatUrl.pathname = "/chat";
  //   return NextResponse.redirect(chatUrl);
  // }

  return NextResponse.next();
}

export const config = {
  matcher: ["/chat/:path*", "/login", "/register"],
};
