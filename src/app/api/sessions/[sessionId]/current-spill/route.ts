import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { orderParticipants } from "@/lib/participant-order";
import { maxParticipantsFor } from "@/lib/session-staleness";

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
    include: {
      participants: true,
      connectionSelections: true,
      table: { select: { tableCode: true } },
    },
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

  const players = orderParticipants(session.participants);
  const me = players.findIndex((p) => p.participantToken === participantToken);

  if (me < 0) {
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

  const [currentSessionSpill, history] = await Promise.all([
    prisma.sessionSpill.findFirst({
      where: { sessionId, completedAt: null },
      orderBy: { sequence: "desc" },
      include: { spill: true },
    }),
    prisma.sessionSpill.findMany({
      where: { sessionId },
      orderBy: { sequence: "asc" },
      select: { sequence: true, passed: true, completedAt: true },
    }),
  ]);

  const selections = session.connectionSelections;

  const myId = players[me].id;
  const endingSubmitted = players.filter(
    (p) => p.wantsStayConnected !== null,
  ).length;
  const mutual =
    session.status === "ENDED" && endingSubmitted === players.length
      ? players.every((p) => p.wantsStayConnected === true)
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
      maxParticipants: maxParticipantsFor(session),
      tableCode: session.table.tableCode,
    },
    participants: players.map((p) => ({
      id: p.id,
      displayName: p.displayName,
    })),
    me,
    connection: {
      mine: selections.some((s) => s.participantId === myId),
      myChoice:
        selections.find((s) => s.participantId === myId)?.connectionType ??
        null,
      submitted: selections.length,
    },
    ending: {
      mine: players[me].wantsStayConnected !== null,
      submitted: endingSubmitted,
      mutual,
    },
    history: history.map((h) => ({
      sequence: h.sequence,
      passed: h.passed,
      completed: h.completedAt !== null,
    })),
    currentSpill: currentSessionSpill
      ? {
          sequence: currentSessionSpill.sequence,
          spill: {
            type: currentSessionSpill.spill.type,
            content: currentSessionSpill.spill.content,
            category: currentSessionSpill.spill.category,
          },
        }
      : null,
  });
}
