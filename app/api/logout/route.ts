import { NextResponse } from "next/server";

// POST: Clears the session cookie
export async function POST() {
  const res = NextResponse.json({ success: true });
  // Remove the session cookie
  res.cookies.set("session", "", {
    httpOnly: true,
    secure: true,
    maxAge: 0,
    path: "/",
    sameSite: "lax",
  });
  return res;
}
