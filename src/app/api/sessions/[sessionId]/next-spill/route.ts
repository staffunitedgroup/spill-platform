import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { nextSpillSchema } from "@/lib/validation/next-spill";
import { selectNextSpill } from "@/lib/spill-engine/select-next-spill";
import { resolveConnectionType } from "@/lib/spill-engine/resolve-connection";
import {
  PASSES_PER_PLAYER,
  TOTAL_SPILLS,
  spotlightFor,
} from "@/lib/spill-engine/game-rules";
import { orderParticipants } from "@/lib/participant-order";

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

  const { participantToken, currentSequence, passed } = parsed.data;

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

  let resolvedType: ReturnType<typeof resolveConnectionType> | null = null;

  if (session.mode === "TWO_PERSON") {
    if (session.connectionSelections.length < 2) {
      return NextResponse.json(
        {
          error: {
            code: "CONNECTION_NOT_RESOLVED",
            message:
              "Both participants must submit connection selection first.",
          },
        },
        { status: 409 },
      );
    }

    resolvedType = resolveConnectionType(
      session.connectionSelections[0].connectionType,
      session.connectionSelections[1].connectionType,
    );
  }

  let result;
  try {
    result = await prisma.$transaction(
      async (tx) => {
        const latest = await tx.sessionSpill.findFirst({
          where: { sessionId },
          orderBy: { sequence: "desc" },
          include: { spill: true },
        });
        const latestSequence = latest?.sequence ?? 0;

        if (
          typeof currentSequence === "number" &&
          currentSequence !== latestSequence &&
          latest &&
          !latest.completedAt
        ) {
          return { exhausted: false as const, sessionSpill: latest };
        }

        if (passed) {
          if (
            !latest ||
            latest.completedAt ||
            currentSequence !== latestSequence
          ) {
            return { stale: true as const };
          }
          const players = orderParticipants(session.participants);
          const myIndex = players.findIndex((p) => p.id === participant.id);
          const n = players.length;
          if (spotlightFor(sessionId, latestSequence, n) !== myIndex) {
            return { error: "PASS_NOT_ALLOWED" as const };
          }
          const passedCards = await tx.sessionSpill.findMany({
            where: { sessionId, passed: true },
            select: { sequence: true },
          });
          const used = passedCards.filter(
            (c) => spotlightFor(sessionId, c.sequence, n) === myIndex,
          ).length;
          if (used >= PASSES_PER_PLAYER) {
            return { error: "NO_PASSES_LEFT" as const };
          }
          await tx.sessionSpill.update({
            where: { id: latest.id },
            data: { completedAt: new Date(), passed: true },
          });
        } else {
          await tx.sessionSpill.updateMany({
            where: { sessionId, completedAt: null },
            data: { completedAt: new Date() },
          });
        }

        if (latestSequence >= TOTAL_SPILLS) {
          return { exhausted: true as const };
        }

        const nextSpill = await selectNextSpill(sessionId, resolvedType, tx);

        if (!nextSpill) {
          return { exhausted: true as const };
        }

        const sessionSpill = await tx.sessionSpill.create({
          data: {
            sessionId,
            spillId: nextSpill.id,
            sequence: latestSequence + 1,
            presentedAt: new Date(),
          },
          include: { spill: true },
        });

        return { exhausted: false as const, sessionSpill };
      },
      {
        maxWait: 10_000,
        timeout: 20_000,
      },
    );
  } catch (err: unknown) {
    const isUniqueConflict =
      typeof err === "object" &&
      err !== null &&
      "code" in err &&
      (err as { code?: string }).code === "P2002";
    if (!isUniqueConflict) {
      console.error("[next-spill] failed", err);
      const code =
        typeof err === "object" && err !== null && "code" in err
          ? String((err as { code?: unknown }).code)
          : "UNKNOWN";
      const message = err instanceof Error ? err.message : String(err);
      return NextResponse.json(
        {
          error: {
            code: "NEXT_SPILL_FAILED",
            message: `Couldn't draw a card (${code}). Trying again…`,
            detail: message.slice(0, 300),
          },
        },
        { status: 500 },
      );
    }
    return NextResponse.json(
      { exhausted: false, alreadyAdvanced: true },
      { status: 200 },
    );
  }

  if ("stale" in result) {
    return NextResponse.json(
      { exhausted: false, alreadyAdvanced: true },
      { status: 200 },
    );
  }

  if ("error" in result) {
    return NextResponse.json(
      {
        error: {
          code: result.error,
          message:
            result.error === "NO_PASSES_LEFT"
              ? "No passes left — time to SPILL."
              : "Only the player in the spotlight can pass this card.",
        },
      },
      { status: 409 },
    );
  }

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
