import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { nextSpillSchema } from "@/lib/validation/next-spill";
import { selectNextSpill } from "@/lib/spill-engine/select-next-spill";
import { resolveConnectionType } from "@/lib/spill-engine/resolve-connection";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> },
) {
  const { sessionId } = await params;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      {
        error: {
          code: "INVALID_JSON",
          message: "Request body must be valid JSON.",
        },
      },
      { status: 400 },
    );
  }

  const parsed = nextSpillSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: {
          code: "VALIDATION_ERROR",
          message: parsed.error.issues[0]?.message ?? "Invalid input.",
        },
      },
      { status: 400 },
    );
  }

  const { participantToken } = parsed.data;

  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    include: { participants: true, connectionSelections: true },
  });

  if (!session) {
    return NextResponse.json(
      { error: { code: "SESSION_NOT_FOUND", message: "Session not found." } },
      { status: 404 },
    );
  }

  const participant = session.participants.find(
    (p) => p.participantToken === participantToken,
  );
  if (!participant) {
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

  if (session.status !== "ACTIVE") {
    return NextResponse.json(
      {
        error: {
          code: "SESSION_UNAVAILABLE",
          message:
            "Session is not active yet. Complete connection selection first.",
        },
      },
      { status: 409 },
    );
  }

  if (session.connectionSelections.length < 2) {
    return NextResponse.json(
      {
        error: {
          code: "CONNECTION_NOT_RESOLVED",
          message: "Both participants must submit connection selection first.",
        },
      },
      { status: 409 },
    );
  }

  const resolvedType = resolveConnectionType(
    session.connectionSelections[0].connectionType,
    session.connectionSelections[1].connectionType,
  );

  const result = await prisma.$transaction(async (tx) => {
    await tx.sessionSpill.updateMany({
      where: { sessionId, completedAt: null },
      data: { completedAt: new Date() },
    });

    const nextSpill = await selectNextSpill(sessionId, resolvedType);

    if (!nextSpill) {
      return { exhausted: true as const };
    }

    const currentCount = await tx.sessionSpill.count({ where: { sessionId } });

    const sessionSpill = await tx.sessionSpill.create({
      data: {
        sessionId,
        spillId: nextSpill.id,
        sequence: currentCount + 1,
        presentedAt: new Date(),
      },
      include: { spill: true },
    });

    return { exhausted: false as const, sessionSpill };
  });

  if (result.exhausted) {
    return NextResponse.json(
      { exhausted: true, message: "No more eligible SPILLs for this session." },
      { status: 200 },
    );
  }

  return NextResponse.json(
    { exhausted: false, currentSpill: result.sessionSpill },
    { status: 201 },
  );
}
