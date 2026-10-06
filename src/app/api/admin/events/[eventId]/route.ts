import { NextRequest, NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin-auth";
import { badRequest, toEventData, unauthorized } from "@/lib/event-admin";
import { prisma } from "@/lib/prisma";
import { eventInputSchema } from "@/lib/validation/event";

type Ctx = { params: Promise<{ eventId: string }> };

function notFound() {
  return NextResponse.json({ error: { code: "NOT_FOUND", message: "Event not found." } }, { status: 404 });
}

// PUT /api/admin/events/:id — replace all fields (the admin form sends everything).
export async function PUT(req: NextRequest, { params }: Ctx) {
  if (!isAdmin(req)) return unauthorized();
  const { eventId } = await params;
  if (!(await prisma.event.findUnique({ where: { id: eventId }, select: { id: true } }))) return notFound();

  const parsed = eventInputSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return badRequest(parsed.error.issues[0]?.message ?? "Please check the form.");

  const result = await toEventData(parsed.data, eventId);
  if ("error" in result) return badRequest(result.error);

  const event = await prisma.event.update({ where: { id: eventId }, data: result.data });
  return NextResponse.json({ event });
}

// PATCH /api/admin/events/:id — quick toggles from the list ({ published } / { featured }).
export async function PATCH(req: NextRequest, { params }: Ctx) {
  if (!isAdmin(req)) return unauthorized();
  const { eventId } = await params;
  const body = (await req.json().catch(() => null)) as { published?: unknown; featured?: unknown } | null;
  const data: { published?: boolean; featured?: boolean } = {};
  if (typeof body?.published === "boolean") data.published = body.published;
  if (typeof body?.featured === "boolean") data.featured = body.featured;
  if (!Object.keys(data).length) return badRequest("Nothing to change.");

  const event = await prisma.event.update({ where: { id: eventId }, data }).catch(() => null);
  return event ? NextResponse.json({ event }) : notFound();
}

// DELETE /api/admin/events/:id — also removes its RSVPs (they stay on the waitlist).
export async function DELETE(req: NextRequest, { params }: Ctx) {
  if (!isAdmin(req)) return unauthorized();
  const { eventId } = await params;
  const deleted = await prisma.event.delete({ where: { id: eventId } }).catch(() => null);
  return deleted ? NextResponse.json({ ok: true }) : notFound();
}
