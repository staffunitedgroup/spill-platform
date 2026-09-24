import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { joinSessionSchema } from "@/lib/validation/participant";
import { generateParticipantToken } from "@/lib/participant-token";
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

    const maxParticipants =
      session.mode === "GROUP" ? (session.groupSize ?? 6) : 2;

    const activeParticipants = session.participants.filter(
      (p) => p.status !== "COMPLETED",
    );

    if (activeParticipants.length >= maxParticipants) {
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

    const isNowFull = activeParticipants.length + 1 >= maxParticipants;

    let sessionStatus: SessionStatus = session.status;
    if (isNowFull) {
      const nextStatus = session.mode === "GROUP" ? "ACTIVE" : "READY";
      const updated = await tx.session.update({
        where: { id: session.id },
        data:
          nextStatus === "ACTIVE"
            ? { status: "ACTIVE", startedAt: new Date() }
            : { status: "READY" },
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
          {
            error: {
              code: result.error,
              message:
                "Something went wrong. Please ask staff to help you start.",
            },
          },
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
              message:
                "This table's SPILL is already in progress. Ask a staff member for help.",
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
