import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { resolveConnectionType } from "@/lib/spill-engine/resolve-connection";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> },
) {
  const { sessionId } = await params;
  const participantToken = req.nextUrl.searchParams.get("participantToken");

  if (!participantToken) {
    return NextResponse.json(
      {
        error: {
          code: "VALIDATION_ERROR",
          message: "participantToken is required.",
        },
      },
      { status: 400 },
    );
  }

  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    include: { participants: true, connectionSelections: true },
  });

  if (!session) {
    return NextResponse.json(
      {
        error: {
          code: "SESSION_NOT_FOUND",
          message: "Something went wrong. Please ask staff to help you start.",
        },
      },
      { status: 404 },
    );
  }

  const isValidParticipant = session.participants.some(
    (p) => p.participantToken === participantToken,
  );

  if (!isValidParticipant) {
    return NextResponse.json(
      {
        error: {
          code: "PARTICIPANT_NOT_FOUND",
          message: "Invalid participant token for this session.",
        },
      },
      { status: 403 },
    );
  }

  const currentSessionSpill = await prisma.sessionSpill.findFirst({
    where: { sessionId, completedAt: null },
    orderBy: { sequence: "desc" },
    include: { spill: true },
  });

  // Needed so the UI can show the agreed connection level after a reload.
  const resolvedConnectionType =
    session.mode === "TWO_PERSON" && session.connectionSelections.length >= 2
      ? resolveConnectionType(
          session.connectionSelections[0].connectionType,
          session.connectionSelections[1].connectionType,
        )
      : null;

  return NextResponse.json({
    session: {
      id: session.id,
      sessionCode: session.sessionCode,
      mode: session.mode,
      groupSize: session.groupSize,
      status: session.status,
      startedAt: session.startedAt,
      endedAt: session.endedAt,
      participants: session.participants.map((p) => ({
        id: p.id,
        displayName: p.displayName,
        status: p.status,
        wantsStayConnected: p.wantsStayConnected,
      })),
    },
    resolvedConnectionType,
    currentSpill: currentSessionSpill ?? null,
  });
}
