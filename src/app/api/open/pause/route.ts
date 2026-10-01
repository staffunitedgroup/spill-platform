import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { pauseSchema } from "@/lib/validation/open-spill";
import { apiError, expireStale, readJson } from "@/lib/open-spill";

// POST /api/open/pause  { token, paused }
// Pause = stay "open" (same name, same 45-minute window) but disappear from
// everyone's list and stop receiving invites. Resume puts you back.
export async function POST(req: NextRequest) {
  const parsed = pauseSchema.safeParse(await readJson(req));
  if (!parsed.success) {
    return apiError("VALIDATION_ERROR", "token and paused are required.", 400);
  }
  const { token, paused } = parsed.data;

  await expireStale();

  const me = await prisma.openPresence.findUnique({
    where: { presenceToken: token },
    select: { id: true, status: true },
  });
  if (!me) {
    return apiError("PRESENCE_NOT_FOUND", "You're not open to SPILL.", 404);
  }

  if (paused && me.status === "OPEN") {
    await prisma.$transaction([
      prisma.openPresence.update({
        where: { id: me.id },
        data: { status: "PAUSED" },
      }),
      // Nobody should be left waiting on someone who just stepped away.
      prisma.spillInvite.updateMany({
        where: { status: "PENDING", OR: [{ fromId: me.id }, { toId: me.id }] },
        data: { status: "CANCELLED", respondedAt: new Date() },
      }),
    ]);
  } else if (!paused && me.status === "PAUSED") {
    await prisma.openPresence.update({
      where: { id: me.id },
      data: { status: "OPEN" },
    });
  } else if (me.status !== "OPEN" && me.status !== "PAUSED") {
    return apiError("NOT_OPEN", "You're not open to SPILL anymore.", 409);
  }

  return NextResponse.json({ ok: true, paused });
}
