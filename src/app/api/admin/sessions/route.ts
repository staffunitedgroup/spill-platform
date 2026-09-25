import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function checkAuth(req: NextRequest) {
  const password = req.headers.get("x-admin-password");
  return password && password === process.env.ADMIN_PASSWORD;
}

export async function GET(req: NextRequest) {
  if (!checkAuth(req)) {
    return NextResponse.json(
      { error: { code: "UNAUTHORIZED", message: "Invalid admin password." } },
      { status: 401 },
    );
  }

  const sessions = await prisma.session.findMany({
    where: { status: { not: "ENDED" } },
    include: {
      table: { select: { tableCode: true, displayName: true } },
      participants: { select: { id: true, displayName: true, status: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ sessions });
}
