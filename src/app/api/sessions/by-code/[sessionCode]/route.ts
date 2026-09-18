import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ sessionCode: string }> },
) {
  const { sessionCode } = await params;

  const session = await prisma.session.findUnique({
    where: { sessionCode },
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

  return NextResponse.json({ session });
}
