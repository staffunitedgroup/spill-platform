import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/admin-auth";
import { apiError } from "@/lib/open-spill";

// POST /api/admin/open/:presenceId/hide — staff take someone off the list.
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ presenceId: string }> },
) {
  if (!isAdmin(req)) {
    return apiError("UNAUTHORIZED", "Invalid admin password.", 401);
  }
  const { presenceId } = await params;

  await prisma.$transaction([
    prisma.openPresence.updateMany({
      where: { id: presenceId, status: { in: ["OPEN", "PAUSED"] } },
      data: { status: "CLOSED" },
    }),
    prisma.spillInvite.updateMany({
      where: {
        status: "PENDING",
        OR: [{ fromId: presenceId }, { toId: presenceId }],
      },
      data: { status: "CANCELLED", respondedAt: new Date() },
    }),
  ]);

  return NextResponse.json({ ok: true });
}
