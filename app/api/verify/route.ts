import { auth } from "@/lib/firebaseAdmin";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const session = req.cookies.get("session");

  if (!session) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  try {
    const decoded = await auth.verifySessionCookie(session.value, true);
    return NextResponse.json({ ok: true, uid: decoded.uid });
  } catch {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
}
