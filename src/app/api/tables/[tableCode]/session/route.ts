import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isSessionStale, maxParticipantsFor } from "@/lib/session-staleness";

// GET /api/tables/:tableCode/session
// Called when someone scans a table QR on THEIR OWN phone: is a SPILL already
// starting at this table (→ join it) or should they start a new one?
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ tableCode: string }> },
) {
  const { tableCode } = await params;

  const table = await prisma.table.findFirst({
    where: { tableCode: tableCode.toUpperCase(), status: "ACTIVE" },
    select: { id: true, tableCode: true, displayName: true },
  });

  if (!table) {
    return NextResponse.json(
      {
        error: {
          code: "TABLE_NOT_FOUND",
          message: "No active table found for this code.",
        },
      },
      { status: 404 },
    );
  }

  const session = await prisma.session.findFirst({
    where: {
      tableId: table.id,
      status: { in: ["WAITING", "READY", "ACTIVE", "ENDING"] },
    },
    orderBy: { createdAt: "desc" },
    include: {
      participants: {
        select: { displayName: true },
        orderBy: { joinedAt: "asc" },
      },
    },
  });

  if (!session || isSessionStale(session)) {
    return NextResponse.json({ table, session: null });
  }

  const maxParticipants = maxParticipantsFor(session);
  return NextResponse.json({
    table,
    session: {
      sessionCode: session.sessionCode,
      status: session.status,
      mode: session.mode,
      groupSize: session.groupSize,
      maxParticipants,
      joined: session.participants.map((p) => p.displayName),
      canJoin:
        session.status === "WAITING" &&
        session.participants.length < maxParticipants,
    },
  });
}
