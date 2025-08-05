import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/firebaseAdmin";

export async function POST(req: NextRequest) {
  try {
    const { idToken } = await req.json();
    console.log("🪪 Received ID Token:", idToken.slice(0, 15), "...");

    const decoded = await auth.verifyIdToken(idToken);
    console.log("✅ Decoded token:", decoded);

    const sessionCookie = await auth.createSessionCookie(idToken, {
      expiresIn: 7 * 24 * 60 * 60 * 1000,
    });

    console.log("🍪 Session created");

    const res = NextResponse.json({ success: true });
    res.cookies.set("session", sessionCookie, {
      httpOnly: true,
      secure: true,
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
      sameSite: "lax",
    });

    return res;
  } catch (err) {
    console.error("❌ Login API error:", err);
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }
}
