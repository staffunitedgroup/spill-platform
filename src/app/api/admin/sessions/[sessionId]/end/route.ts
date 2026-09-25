import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function checkAuth(req: NextRequest) {
  const password = req.headers.get("x-admin-password");
  return password && password === process.env.ADMIN_PASSWORD;
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> },
) {
  if (!checkAuth(req)) {
    return NextResponse.json(
      { error: { code: "UNAUTHORIZED", message: "Invalid admin password." } },
      { status: 401 },
    );
  }

  const { sessionId } = await params;

  const session = await prisma.session.findUnique({ where: { id: sessionId } });
  if (!session) {
    return NextResponse.json(
      { error: { code: "SESSION_NOT_FOUND", message: "Session not found." } },
      { status: 404 },
    );
  }

  const updated = await prisma.session.update({
    where: { id: sessionId },
    data: { status: "ENDED", endedAt: new Date() },
  });

  return NextResponse.json({ session: updated });
}
