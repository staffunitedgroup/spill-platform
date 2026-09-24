import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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
    include: { participants: true },
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

  return NextResponse.json({
    session,
    currentSpill: currentSessionSpill ?? null,
  });
}
