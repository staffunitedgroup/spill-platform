import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createSessionSchema } from "@/lib/validation/session";
import { generateSessionCode } from "@/lib/session-code";

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

  const { tableCode } = parsed.data;

  // 1. Tìm bàn theo tableCode
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

  // 2. Nếu bàn đã có session chưa kết thúc → trả về session đó (idempotent)
  const existingSession = await prisma.session.findFirst({
    where: {
      tableId: table.id,
      status: { in: ["WAITING", "READY", "ACTIVE"] },
    },
    orderBy: { createdAt: "desc" },
  });

  if (existingSession) {
    return NextResponse.json({ session: existingSession }, { status: 200 });
  }

  // 3. Tạo session mới, đảm bảo sessionCode không trùng
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
          mode: "TWO_PERSON",
          status: "WAITING",
        },
      });
    } catch (err: unknown) {
      // Trùng sessionCode (rất hiếm) → thử lại
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
