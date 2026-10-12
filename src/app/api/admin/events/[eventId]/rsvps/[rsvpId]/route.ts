import { NextRequest, NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin-auth";
import { unauthorized } from "@/lib/event-admin";
import { prisma } from "@/lib/prisma";

// DELETE /api/admin/events/:eventId/rsvps/:rsvpId — take one guest off an event's list.
// They stay on the waitlist.
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ eventId: string; rsvpId: string }> }) {
  if (!isAdmin(req)) return unauthorized();
  const { eventId, rsvpId } = await params;
  const { count } = await prisma.eventRsvp.deleteMany({ where: { id: rsvpId, eventId } });
  if (!count) return NextResponse.json({ error: { code: "NOT_FOUND", message: "Already removed." } }, { status: 404 });
  return NextResponse.json({ ok: true });
}
