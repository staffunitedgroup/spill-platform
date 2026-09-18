import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> },
) {
  const { sessionId } = await params;

  const session = await prisma.session.findUnique({
    where: { id: sessionId },
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
