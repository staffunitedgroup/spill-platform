import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { connectionSelectionSchema } from "@/lib/validation/connection-selection";
import { resolveConnectionType } from "@/lib/spill-engine/resolve-connection";
import type { SessionStatus } from "@/generated/prisma/enums";

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

  const parsed = connectionSelectionSchema.safeParse(body);
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

  const { participantToken, connectionType } = parsed.data;

  const result = await prisma.$transaction(async (tx) => {
    const session = await tx.session.findUnique({
      where: { id: sessionId },
      include: { participants: true, connectionSelections: true },
    });

    if (!session) {
      return { error: "SESSION_NOT_FOUND" as const };
    }

    const participant = session.participants.find(
      (p) => p.participantToken === participantToken,
    );

    if (!participant) {
      return { error: "PARTICIPANT_NOT_FOUND" as const };
    }

    if (session.status !== "READY" && session.status !== "ACTIVE") {
      return { error: "SESSION_UNAVAILABLE" as const };
    }

    await tx.connectionSelection.upsert({
      where: {
        sessionId_participantId: {
          sessionId: session.id,
          participantId: participant.id,
        },
      },
      create: {
        sessionId: session.id,
        participantId: participant.id,
        connectionType,
      },
      update: {
        connectionType,
      },
    });

    const allSelections = await tx.connectionSelection.findMany({
      where: { sessionId: session.id },
    });

    const bothSubmitted = allSelections.length >= session.participants.length;

    let sessionStatus: SessionStatus = session.status;
    let startedAt = session.startedAt;

    if (bothSubmitted && session.status === "READY") {
      const updated = await tx.session.update({
        where: { id: session.id },
        data: { status: "ACTIVE", startedAt: new Date() },
      });
      sessionStatus = updated.status;
      startedAt = updated.startedAt;
    }

    let resolvedType: string | null = null;
    if (bothSubmitted && allSelections.length === 2) {
      resolvedType = resolveConnectionType(
        allSelections[0].connectionType,
        allSelections[1].connectionType,
      );
    }

    return {
      yourSelection: connectionType,
      bothSubmitted,
      resolvedType,
      session: {
        id: session.id,
        status: sessionStatus,
        startedAt,
      },
    };
  });

  if ("error" in result) {
    switch (result.error) {
      case "SESSION_NOT_FOUND":
        return NextResponse.json(
          {
            error: {
              code: result.error,
              message:
                "Something went wrong. Please ask staff to help you start.",
            },
          },
          { status: 404 },
        );
      case "PARTICIPANT_NOT_FOUND":
        return NextResponse.json(
          {
            error: {
              code: result.error,
              message: "Invalid participant token for this session.",
            },
          },
          { status: 403 },
        );
      case "SESSION_UNAVAILABLE":
        return NextResponse.json(
          {
            error: {
              code: result.error,
              message: "This session is not ready for connection selection.",
            },
          },
          { status: 409 },
        );
    }
  }

  return NextResponse.json(
    {
      yourSelection: result.yourSelection,
      bothSubmitted: result.bothSubmitted,
      resolvedType: result.resolvedType,
      session: result.session,
    },
    { status: 200 },
  );
}
