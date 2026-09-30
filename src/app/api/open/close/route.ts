import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { tokenSchema } from "@/lib/validation/open-spill";
import { apiError, readJson } from "@/lib/open-spill";

// POST /api/open/close — "Hide me": stop being listed, cancel pending invites.
// Also called when the person starts a game with their own table instead.
export async function POST(req: NextRequest) {
  const parsed = tokenSchema.safeParse(await readJson(req));
  if (!parsed.success) {
    return apiError("VALIDATION_ERROR", "token is required.", 400);
  }

  const me = await prisma.openPresence.findUnique({
    where: { presenceToken: parsed.data.token },
    select: { id: true, status: true },
  });
  if (!me) {
    return apiError("PRESENCE_NOT_FOUND", "You're not open to SPILL.", 404);
  }

  if (me.status === "OPEN") {
    await prisma.$transaction([
      prisma.openPresence.update({
        where: { id: me.id },
        data: { status: "CLOSED" },
      }),
      prisma.spillInvite.updateMany({
        where: { status: "PENDING", OR: [{ fromId: me.id }, { toId: me.id }] },
        data: { status: "CANCELLED" },
      }),
    ]);
  }

  return NextResponse.json({ ok: true });
}
