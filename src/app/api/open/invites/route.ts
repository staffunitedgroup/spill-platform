import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createInviteSchema } from "@/lib/validation/open-spill";
import {
  INVITE_SECONDS,
  TX_OPTIONS,
  apiError,
  expireStale,
  lockPresences,
  readJson,
} from "@/lib/open-spill";

const MESSAGES = {
  NOT_OPEN: ["You're not open to SPILL anymore.", 409],
  TARGET_UNAVAILABLE: ["They're not available right now.", 409],
  ALREADY_INVITING: ["You already have an invite waiting for an answer.", 409],
  ANSWER_FIRST: ["Someone just invited you — answer them first.", 409],
  TARGET_BUSY: [
    "They're answering another invite. Try again in a minute.",
    409,
  ],
} as const;

// POST /api/open/invites — "Invite to SPILL" someone from the Available list.
export async function POST(req: NextRequest) {
  const parsed = createInviteSchema.safeParse(await readJson(req));
  if (!parsed.success) {
    return apiError(
      "VALIDATION_ERROR",
      parsed.error.issues[0]?.message ?? "Invalid input.",
      400,
    );
  }
  const { token, toId } = parsed.data;

  await expireStale();

  const me = await prisma.openPresence.findUnique({
    where: { presenceToken: token },
    select: { id: true },
  });
  if (!me) {
    return apiError("PRESENCE_NOT_FOUND", "You're not open to SPILL.", 404);
  }
  if (me.id === toId) {
    return apiError("VALIDATION_ERROR", "You can't invite yourself.", 400);
  }

  const result = await prisma.$transaction(async (tx) => {
    await lockPresences(tx, [me.id, toId]);
    const now = new Date();

    const [fresh, target] = await Promise.all([
      tx.openPresence.findUnique({
        where: { id: me.id },
        include: { table: { select: { venueId: true } } },
      }),
      tx.openPresence.findUnique({
        where: { id: toId },
        include: { table: { select: { venueId: true } } },
      }),
    ]);

    if (!fresh || fresh.status !== "OPEN" || fresh.expiresAt <= now) {
      return { ok: false as const, error: "NOT_OPEN" as const };
    }
    if (
      !target ||
      target.status !== "OPEN" ||
      target.expiresAt <= now ||
      target.table.venueId !== fresh.table.venueId
    ) {
      return { ok: false as const, error: "TARGET_UNAVAILABLE" as const };
    }

    const [myPendingOut, myPendingIn, targetPendingIn, declinedBefore] =
      await Promise.all([
        tx.spillInvite.count({ where: { fromId: me.id, status: "PENDING" } }),
        tx.spillInvite.count({ where: { toId: me.id, status: "PENDING" } }),
        tx.spillInvite.count({ where: { toId, status: "PENDING" } }),
        tx.spillInvite.count({
          where: { fromId: me.id, toId, status: "DECLINED" },
        }),
      ]);

    // After a "Not now" you can't ask the same person again this visit.
    if (declinedBefore > 0)
      return { ok: false as const, error: "TARGET_UNAVAILABLE" as const };
    if (myPendingOut > 0)
      return { ok: false as const, error: "ALREADY_INVITING" as const };
    if (myPendingIn > 0)
      return { ok: false as const, error: "ANSWER_FIRST" as const };
    if (targetPendingIn > 0)
      return { ok: false as const, error: "TARGET_BUSY" as const };

    const invite = await tx.spillInvite.create({
      data: {
        fromId: me.id,
        toId,
        expiresAt: new Date(now.getTime() + INVITE_SECONDS * 1000),
      },
    });
    return { ok: true as const, invite, toName: target.displayName };
  }, TX_OPTIONS);

  if (!result.ok) {
    const [message, status] = MESSAGES[result.error];
    return apiError(result.error, message, status);
  }

  return NextResponse.json(
    {
      invite: {
        id: result.invite.id,
        toName: result.toName,
        expiresAt: result.invite.expiresAt,
      },
    },
    { status: 201 },
  );
}
