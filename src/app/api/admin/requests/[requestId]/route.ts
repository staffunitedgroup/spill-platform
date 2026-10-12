import { NextRequest, NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin-auth";
import { unauthorized } from "@/lib/event-admin";
import { prisma } from "@/lib/prisma";
import { bookingUpdateSchema } from "@/lib/validation/booking";

type Params = { params: Promise<{ requestId: string }> };

const notFound = () => NextResponse.json({ error: { code: "NOT_FOUND", message: "Request not found." } }, { status: 404 });

// PATCH /api/admin/requests/:id — change status or team notes.
export async function PATCH(req: NextRequest, { params }: Params) {
  if (!isAdmin(req)) return unauthorized();
  const parsed = bookingUpdateSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: { code: "INVALID", message: "Please check and try again." } }, { status: 400 });
  const { requestId } = await params;
  const { count } = await prisma.bookingRequest.updateMany({ where: { id: requestId }, data: parsed.data });
  if (!count) return notFound();
  return NextResponse.json({ ok: true });
}

// DELETE /api/admin/requests/:id — e.g. test or spam requests.
export async function DELETE(req: NextRequest, { params }: Params) {
  if (!isAdmin(req)) return unauthorized();
  const { requestId } = await params;
  const { count } = await prisma.bookingRequest.deleteMany({ where: { id: requestId } });
  if (!count) return notFound();
  return NextResponse.json({ ok: true });
}
