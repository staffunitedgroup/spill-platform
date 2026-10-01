import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { connectionUpdateSchema } from "@/lib/validation/stay-connected";
import { apiError, readJson } from "@/lib/open-spill";
import { currentGuestId } from "@/lib/guest-auth";

// POST /api/me/connections/:id  { notify? } | { remove: true }
// notify=false → "don't tell me when they're back" (only my side).
// remove       → the connection is gone for both. They aren't told.
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ connectionId: string }> },
) {
  const guestId = await currentGuestId();
  if (!guestId) {
    return apiError("NOT_SIGNED_IN", "Not signed in.", 401);
  }
  const { connectionId } = await params;
  const parsed = connectionUpdateSchema.safeParse(await readJson(req));
  if (!parsed.success) {
    return apiError("VALIDATION_ERROR", "Nothing to change.", 400);
  }

  const c = await prisma.spillConnection.findUnique({
    where: { id: connectionId },
  });
  if (!c || (c.guestAId !== guestId && c.guestBId !== guestId)) {
    return apiError("NOT_FOUND", "Connection not found.", 404);
  }

  if (parsed.data.remove) {
    await prisma.spillConnection.delete({ where: { id: c.id } });
    return NextResponse.json({ ok: true, removed: true });
  }

  const iAmA = c.guestAId === guestId;
  await prisma.spillConnection.update({
    where: { id: c.id },
    data: iAmA
      ? { mutedByA: !parsed.data.notify }
      : { mutedByB: !parsed.data.notify },
  });
  return NextResponse.json({ ok: true, notify: parsed.data.notify });
}
