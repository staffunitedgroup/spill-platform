import { NextRequest, NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin-auth";
import { csvResponse } from "@/lib/csv";
import { prisma } from "@/lib/prisma";

// GET /api/admin/waitlist[?location=saigon][&format=csv]
export async function GET(req: NextRequest) {
  if (!isAdmin(req)) {
    return NextResponse.json(
      { error: { code: "UNAUTHORIZED", message: "Invalid admin password." } },
      { status: 401 },
    );
  }

  const location = req.nextUrl.searchParams.get("location") || undefined;
  const signups = await prisma.waitlistSignup.findMany({
    where: location ? { locationSlug: location } : undefined,
    // Latest activity first, so someone signing up again shows at the top.
    orderBy: { updatedAt: "desc" },
  });

  // Each person's event RSVPs at that location, with how many people they're bringing.
  const rsvps = await prisma.eventRsvp.findMany({
    where: { email: { in: [...new Set(signups.map((s) => s.email))] } },
    select: { email: true, partySize: true, event: { select: { title: true, slug: true, locationSlug: true, startsAt: true } } },
    orderBy: { event: { startsAt: "asc" } },
  });
  const withRsvps = signups.map((s) => ({
    ...s,
    rsvps: rsvps
      .filter((r) => r.email === s.email && r.event.locationSlug === s.locationSlug)
      .map((r) => ({ title: r.event.title, slug: r.event.slug, startsAt: r.event.startsAt, partySize: r.partySize })),
  }));

  if (req.nextUrl.searchParams.get("format") === "csv") {
    return csvResponse(
      `spill-waitlist${location ? `-${location}` : ""}.csv`,
      ["Signed up", "Last updated", "Location", "Name", "Email", "WhatsApp", "Interests", "Event RSVPs", "Source"],
      withRsvps.map((s) => [
        s.createdAt.toISOString(),
        s.updatedAt.toISOString(),
        s.locationSlug,
        s.name,
        s.email,
        s.whatsapp,
        s.interests.join("; "),
        s.rsvps.map((r) => `${r.title} (${r.partySize} ${r.partySize === 1 ? "person" : "people"})`).join("; "),
        s.source,
      ]),
    );
  }

  return NextResponse.json({ signups: withRsvps, total: signups.length });
}
