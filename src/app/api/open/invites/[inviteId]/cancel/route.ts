import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { tokenSchema } from "@/lib/validation/open-spill";
import { apiError, readJson } from "@/lib/open-spill";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ inviteId: string }> },
) {
  const { inviteId } = await params;
  const parsed = tokenSchema.safeParse(await readJson(req));
  if (!parsed.success) {
    return apiError("VALIDATION_ERROR", "token is required.", 400);
  }

  const me = await prisma.openPresence.findUnique({
    where: { presenceToken: parsed.data.token },
    select: { id: true },
  });
  if (!me) {
    return apiError("PRESENCE_NOT_FOUND", "You're not open to SPILL.", 404);
  }

  await prisma.spillInvite.updateMany({
    where: { id: inviteId, fromId: me.id, status: "PENDING" },
    data: { status: "CANCELLED", respondedAt: new Date() },
  });

  return NextResponse.json({ ok: true });
}
