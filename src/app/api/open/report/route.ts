import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { reportSchema } from "@/lib/validation/open-spill";
import {
  AUTO_HIDE_REPORTS,
  TX_OPTIONS,
  apiError,
  lockPresences,
  readJson,
} from "@/lib/open-spill";

// POST /api/open/report  { token, targetId, reason, note? }
// Anyone in "Meet someone new" can report someone they saw in the list, got an
// invite from, or matched with. Effects, right away:
//   • the two of them never see or invite each other again tonight
//   • any pending invite between them is cancelled
//   • reported by AUTO_HIDE_REPORTS different people → hidden automatically
// Staff review every report in /admin.
export async function POST(req: NextRequest) {
  const parsed = reportSchema.safeParse(await readJson(req));
  if (!parsed.success) {
    return apiError(
      "VALIDATION_ERROR",
      parsed.error.issues[0]?.message ?? "Invalid input.",
      400,
    );
  }
  const { token, targetId, reason, note } = parsed.data;

  const me = await prisma.openPresence.findUnique({
    where: { presenceToken: token },
    select: { id: true, table: { select: { venueId: true } } },
  });
  if (!me) {
    return apiError("PRESENCE_NOT_FOUND", "You're not open to SPILL.", 404);
  }
  if (me.id === targetId) {
    return apiError("VALIDATION_ERROR", "You can't report yourself.", 400);
  }

  const target = await prisma.openPresence.findUnique({
    where: { id: targetId },
    select: { id: true, table: { select: { venueId: true } } },
  });
  if (!target || target.table.venueId !== me.table.venueId) {
    return apiError("TARGET_NOT_FOUND", "That person isn't here.", 404);
  }

  await prisma.$transaction(async (tx) => {
    await lockPresences(tx, [me.id, targetId]);

    // One report per person per night is enough.
    const already = await tx.spillReport.findFirst({
      where: { reporterId: me.id, reportedId: targetId },
      select: { id: true },
    });
    if (!already) {
      await tx.spillReport.create({
        data: {
          reporterId: me.id,
          reportedId: targetId,
          reason,
          note: note || null,
        },
      });
    }

    await tx.spillInvite.updateMany({
      where: {
        status: "PENDING",
        OR: [
          { fromId: me.id, toId: targetId },
          { fromId: targetId, toId: me.id },
        ],
      },
      data: { status: "CANCELLED", respondedAt: new Date() },
    });

    const reporters = await tx.spillReport.findMany({
      where: { reportedId: targetId, status: "OPEN" },
      distinct: ["reporterId"],
      select: { reporterId: true },
    });
    if (reporters.length >= AUTO_HIDE_REPORTS) {
      await tx.openPresence.updateMany({
        where: { id: targetId, status: { in: ["OPEN", "PAUSED"] } },
        data: { status: "CLOSED" },
      });
      await tx.spillInvite.updateMany({
        where: {
          status: "PENDING",
          OR: [{ fromId: targetId }, { toId: targetId }],
        },
        data: { status: "CANCELLED", respondedAt: new Date() },
      });
    }
  }, TX_OPTIONS);

  return NextResponse.json({ ok: true }, { status: 201 });
}
