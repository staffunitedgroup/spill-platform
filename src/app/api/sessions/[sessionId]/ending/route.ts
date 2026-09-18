import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { endingSchema } from "@/lib/validation/ending";

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

  const parsed = endingSchema.safeParse(body);
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

  const { participantToken, wantsStayConnected } = parsed.data;

  const result = await prisma.$transaction(async (tx) => {
    const session = await tx.session.findUnique({
      where: { id: sessionId },
      include: { participants: true },
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

    if (session.status !== "ACTIVE" && session.status !== "ENDING") {
      return { error: "SESSION_UNAVAILABLE" as const };
    }

    await tx.participant.update({
      where: { id: participant.id },
      data: { wantsStayConnected, status: "COMPLETED" },
    });

    // Chuyển ENDING ngay khi người đầu tiên bấm kết thúc, khóa next-spill/connection-selection
    if (session.status === "ACTIVE") {
      await tx.session.update({
        where: { id: session.id },
        data: { status: "ENDING" },
      });
    }

    const allParticipants = await tx.participant.findMany({
      where: { sessionId: session.id },
    });

    const bothSubmitted = allParticipants.every(
      (p) => p.wantsStayConnected !== null,
    );

    if (!bothSubmitted) {
      return { bothSubmitted: false as const };
    }

    // Chỉ tạo Connection MUTUAL khi CẢ 2 đều chọn true
    const mutual = allParticipants.every((p) => p.wantsStayConnected === true);

    if (mutual && allParticipants.length === 2) {
      const [a, b] = allParticipants;
      await tx.connection.create({
        data: {
          sessionId: session.id,
          participantAId: a.id,
          participantBId: b.id,
          status: "MUTUAL",
        },
      });
    }

    const endedSession = await tx.session.update({
      where: { id: session.id },
      data: { status: "ENDED", endedAt: new Date() },
    });

    return {
      bothSubmitted: true as const,
      mutual,
      session: { id: endedSession.id, status: endedSession.status },
    };
  });

  if ("error" in result) {
    switch (result.error) {
      case "SESSION_NOT_FOUND":
        return NextResponse.json(
          { error: { code: result.error, message: "Session not found." } },
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
              message: "This session cannot be ended right now.",
            },
          },
          { status: 409 },
        );
    }
  }

  if (!result.bothSubmitted) {
    return NextResponse.json(
      {
        bothSubmitted: false,
        message: "Waiting for the other person to finish too.",
      },
      { status: 200 },
    );
  }

  return NextResponse.json(
    { bothSubmitted: true, mutual: result.mutual, session: result.session },
    { status: 200 },
  );
}
