import { NextRequest, NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin-auth";
import { unauthorized } from "@/lib/event-admin";
import { prisma } from "@/lib/prisma";

// DELETE /api/admin/waitlist/:id — remove one person from a location's list
// (e.g. test sign-ups). Their event RSVPs are kept; remove those per event.
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ signupId: string }> }) {
  if (!isAdmin(req)) return unauthorized();
  const { signupId } = await params;
  const { count } = await prisma.waitlistSignup.deleteMany({ where: { id: signupId } });
  if (!count) return NextResponse.json({ error: { code: "NOT_FOUND", message: "Already removed." } }, { status: 404 });
  return NextResponse.json({ ok: true });
}
