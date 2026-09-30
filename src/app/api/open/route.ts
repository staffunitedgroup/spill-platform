import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { openSchema } from "@/lib/validation/open-spill";
import {
  OPEN_MINUTES,
  apiError,
  expireStale,
  generatePresenceToken,
  readJson,
} from "@/lib/open-spill";

export async function POST(req: NextRequest) {
  const body = await readJson(req);
  if (body === undefined) {
    return apiError("INVALID_JSON", "Request body must be valid JSON.", 400);
  }
  const parsed = openSchema.safeParse(body);
  if (!parsed.success) {
    return apiError(
      "VALIDATION_ERROR",
      parsed.error.issues[0]?.message ?? "Invalid input.",
      400,
    );
  }
  const { tableCode, displayName, previousToken } = parsed.data;

  const table = await prisma.table.findFirst({
    where: { tableCode: tableCode.toUpperCase(), status: "ACTIVE" },
    select: { id: true, tableCode: true, displayName: true },
  });
  if (!table) {
    return apiError(
      "TABLE_NOT_FOUND",
      "No active table found for this code.",
      404,
    );
  }

  await expireStale();

  const now = new Date();
  const presence = await prisma.$transaction(async (tx) => {
    // Re-opening from the same phone replaces the old presence.
    if (previousToken) {
      const old = await tx.openPresence.findUnique({
        where: { presenceToken: previousToken },
        select: { id: true, status: true },
      });
      if (old && old.status === "OPEN") {
        await tx.openPresence.update({
          where: { id: old.id },
          data: { status: "CLOSED" },
        });
        await tx.spillInvite.updateMany({
          where: {
            status: "PENDING",
            OR: [{ fromId: old.id }, { toId: old.id }],
          },
          data: { status: "CANCELLED" },
        });
      }
    }
    return tx.openPresence.create({
      data: {
        tableId: table.id,
        displayName,
        presenceToken: generatePresenceToken(),
        ageConfirmedAt: now,
        expiresAt: new Date(now.getTime() + OPEN_MINUTES * 60_000),
      },
    });
  });

  return NextResponse.json(
    {
      presence: {
        id: presence.id,
        token: presence.presenceToken,
        displayName: presence.displayName,
        expiresAt: presence.expiresAt,
        table: { code: table.tableCode, name: table.displayName },
      },
    },
    { status: 201 },
  );
}
