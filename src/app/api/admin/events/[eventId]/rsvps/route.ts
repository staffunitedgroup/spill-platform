import { NextRequest, NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin-auth";
import { csvResponse } from "@/lib/csv";
import { unauthorized } from "@/lib/event-admin";
import { prisma } from "@/lib/prisma";

// GET /api/admin/events/:id/rsvps[?format=csv] — the guest list for one event.
export async function GET(req: NextRequest, { params }: { params: Promise<{ eventId: string }> }) {
  if (!isAdmin(req)) return unauthorized();
  const { eventId } = await params;

  const event = await prisma.event.findUnique({
    where: { id: eventId },
    select: { slug: true, title: true, rsvps: { orderBy: { createdAt: "asc" } } },
  });
  if (!event) return NextResponse.json({ error: { code: "NOT_FOUND", message: "Event not found." } }, { status: 404 });

  if (req.nextUrl.searchParams.get("format") === "csv") {
    return csvResponse(
      `spill-rsvps-${event.slug}.csv`,
      ["Signed up", "Name", "Email", "WhatsApp", "Party size"],
      event.rsvps.map((r) => [r.createdAt.toISOString(), r.name, r.email, r.whatsapp, r.partySize]),
    );
  }
  return NextResponse.json({ title: event.title, rsvps: event.rsvps });
}
