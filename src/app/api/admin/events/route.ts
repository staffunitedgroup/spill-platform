import { NextRequest, NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin-auth";
import { badRequest, toEventData, unauthorized } from "@/lib/event-admin";
import { prisma } from "@/lib/prisma";
import { eventInputSchema } from "@/lib/validation/event";

// GET /api/admin/events[?location=saigon] — every event (drafts too) with RSVP totals.
export async function GET(req: NextRequest) {
  if (!isAdmin(req)) return unauthorized();
  const location = req.nextUrl.searchParams.get("location") || undefined;

  const [events, totals] = await Promise.all([
    prisma.event.findMany({
      where: location ? { locationSlug: location } : undefined,
      orderBy: { startsAt: "desc" },
    }),
    prisma.eventRsvp.groupBy({
      by: ["eventId"],
      _count: { _all: true },
      _sum: { partySize: true },
    }),
  ]);
  const byEvent = new Map(totals.map((t) => [t.eventId, { rsvps: t._count._all, people: t._sum.partySize ?? 0 }]));

  return NextResponse.json({
    events: events.map((e) => ({ ...e, ...(byEvent.get(e.id) ?? { rsvps: 0, people: 0 }) })),
  });
}

// POST /api/admin/events — create.
export async function POST(req: NextRequest) {
  if (!isAdmin(req)) return unauthorized();
  const parsed = eventInputSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return badRequest(parsed.error.issues[0]?.message ?? "Please check the form.");

  const result = await toEventData(parsed.data);
  if ("error" in result) return badRequest(result.error);

  const event = await prisma.event.create({ data: result.data });
  return NextResponse.json({ event }, { status: 201 });
}
