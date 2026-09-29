import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createSessionSchema } from "@/lib/validation/session";
import { generateSessionCode } from "@/lib/session-code";
import { isSessionStale } from "@/lib/session-staleness";

export async function POST(req: NextRequest) {
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

  const parsed = createSessionSchema.safeParse(body);

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

  const { tableCode, mode, groupSize } = parsed.data;

  const table = await prisma.table.findFirst({
    where: { tableCode: tableCode.toUpperCase(), status: "ACTIVE" },
  });

  if (!table) {
    return NextResponse.json(
      {
        error: {
          code: "TABLE_NOT_FOUND",
          message: "No active table found for this code.",
        },
      },
      { status: 404 },
    );
  }

  const existingSession = await prisma.session.findFirst({
    where: {
      tableId: table.id,
      status: { in: ["WAITING", "READY", "ACTIVE", "ENDING"] },
    },
    orderBy: { createdAt: "desc" },
  });

  if (existingSession) {
    const isStale = isSessionStale(existingSession);

    if (!isStale) {
      return NextResponse.json({ session: existingSession }, { status: 200 });
    }

    await prisma.session.update({
      where: { id: existingSession.id },
      data: { status: "ENDED" },
    });
  }

  let session;
  let attempts = 0;

  while (!session && attempts < 5) {
    attempts++;
    const sessionCode = generateSessionCode();

    try {
      session = await prisma.session.create({
        data: {
          tableId: table.id,
          sessionCode,
          mode,
          groupSize: mode === "GROUP" ? groupSize : null,
          status: "WAITING",
        },
      });
    } catch (err: unknown) {
      const isUniqueConflict =
        typeof err === "object" &&
        err !== null &&
        "code" in err &&
        (err as { code?: string }).code === "P2002";

      if (!isUniqueConflict) throw err;
    }
  }

  if (!session) {
    return NextResponse.json(
      {
        error: {
          code: "SESSION_CREATE_FAILED",
          message: "Could not create a unique session code, please try again.",
        },
      },
      { status: 500 },
    );
  }

  return NextResponse.json({ session }, { status: 201 });
}
