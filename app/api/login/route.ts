import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/firebaseAdmin";

export async function POST(req: NextRequest) {
  try {
    const { idToken } = await req.json();

    const decoded = await auth.verifyIdToken(idToken);
    const expiresIn = 7 * 24 * 60 * 60 * 1000;

    const sessionCookie = await auth.createSessionCookie(idToken, {
      expiresIn,
    });

    const res = NextResponse.json({ success: true });
    res.cookies.set("session", sessionCookie, {
      httpOnly: true,
      secure: true,
      maxAge: expiresIn / 1000,
      path: "/",
      sameSite: "lax",
    });

    return res;
  } catch (err) {
    console.error("🔥 Login error:", err);
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }
}
