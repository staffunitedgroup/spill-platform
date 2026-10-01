import { NextResponse } from "next/server";
import { signOut } from "@/lib/guest-auth";

// POST /api/auth/logout — sign out on this phone.
export async function POST() {
  await signOut();
  return NextResponse.json({ ok: true });
}
