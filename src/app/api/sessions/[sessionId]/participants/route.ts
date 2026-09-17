import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { joinSessionSchema } from "@/lib/validation/participant";
import { generateParticipantToken } from "@/lib/participant-token";
import type { SessionStatus } from "@/generated/prisma/enums";

const MAX_PARTICIPANTS = 2;

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

  const parsed = joinSessionSchema.safeParse(body);
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

  const { displayName } = parsed.data;

  // Dùng transaction để tránh race condition khi 2 người bấm Join gần như cùng lúc
  const result = await prisma.$transaction(async (tx) => {
    const session = await tx.session.findUnique({
      where: { id: sessionId },
      include: { participants: true },
    });

    if (!session) {
      return { error: "SESSION_NOT_FOUND" as const };
    }

    if (session.status !== "WAITING" && session.status !== "READY") {
      return { error: "SESSION_UNAVAILABLE" as const };
    }

    const activeParticipants = session.participants.filter(
      (p) => p.status !== "COMPLETED",
    );

    if (activeParticipants.length >= MAX_PARTICIPANTS) {
      return { error: "SESSION_FULL" as const };
    }

    const participant = await tx.participant.create({
      data: {
        sessionId: session.id,
        displayName,
        participantToken: generateParticipantToken(),
        status: "WAITING",
      },
    });

    const isNowFull = activeParticipants.length + 1 >= MAX_PARTICIPANTS;

    let sessionStatus: SessionStatus = session.status;
    if (isNowFull) {
      const updated = await tx.session.update({
        where: { id: session.id },
        data: { status: "READY" },
      });
      sessionStatus = updated.status;
    }

    return {
      participant,
      session: { id: session.id, status: sessionStatus },
    };
  });

  if ("error" in result) {
    switch (result.error) {
      case "SESSION_NOT_FOUND":
        return NextResponse.json(
          { error: { code: result.error, message: "Session not found." } },
          { status: 404 },
        );
      case "SESSION_UNAVAILABLE":
        return NextResponse.json(
          {
            error: {
              code: result.error,
              message: "This session is no longer accepting participants.",
            },
          },
          { status: 409 },
        );
      case "SESSION_FULL":
        return NextResponse.json(
          {
            error: {
              code: result.error,
              message: "This SPILL session is already full.",
            },
          },
          { status: 409 },
        );
    }
  }

  return NextResponse.json(
    {
      participant: result.participant,
      session: result.session,
    },
    { status: 201 },
  );
}
