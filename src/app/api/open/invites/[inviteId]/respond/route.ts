import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { respondInviteSchema } from "@/lib/validation/open-spill";
import {
  TX_OPTIONS,
  apiError,
  expireStale,
  generateMeetCode,
  lockPresences,
  pickMeetColor,
  readJson,
} from "@/lib/open-spill";
import { generateSessionCode } from "@/lib/session-code";
import { generateParticipantToken } from "@/lib/participant-token";

// POST /api/open/invites/:inviteId/respond  { token, accept }
// Only the invited person can answer.
//  • Not now → DECLINED (the inviter just sees "not available right now").
//  • Accept  → a 2-person SPILL is created at the invitee's table, both phones
//              are added as players, both stop being listed, and both get the
//              same meet colour + code.
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ inviteId: string }> },
) {
  const { inviteId } = await params;
  const parsed = respondInviteSchema.safeParse(await readJson(req));
  if (!parsed.success) {
    return apiError(
      "VALIDATION_ERROR",
      parsed.error.issues[0]?.message ?? "Invalid input.",
      400,
    );
  }
  const { token, accept } = parsed.data;

  await expireStale();

  const me = await prisma.openPresence.findUnique({
    where: { presenceToken: token },
    select: { id: true },
  });
  if (!me) {
    return apiError("PRESENCE_NOT_FOUND", "You're not open to SPILL.", 404);
  }

  const invite = await prisma.spillInvite.findUnique({
    where: { id: inviteId },
    select: { id: true, fromId: true, toId: true },
  });
  if (!invite || invite.toId !== me.id) {
    return apiError("INVITE_NOT_FOUND", "This invite isn't for you.", 404);
  }

  const result = await prisma.$transaction(async (tx) => {
    await lockPresences(tx, [invite.fromId, invite.toId]);
    const now = new Date();

    const fresh = await tx.spillInvite.findUnique({
      where: { id: invite.id },
      include: { from: true, to: true },
    });
    if (!fresh || fresh.status !== "PENDING" || fresh.expiresAt <= now) {
      return { error: "INVITE_GONE" as const };
    }

    if (!accept) {
      await tx.spillInvite.update({
        where: { id: fresh.id },
        data: { status: "DECLINED", respondedAt: now },
      });
      return { declined: true as const };
    }

    const stillOpen = (p: typeof fresh.from) =>
      p.status === "OPEN" && p.expiresAt > now;
    if (!stillOpen(fresh.from) || !stillOpen(fresh.to)) {
      await tx.spillInvite.update({
        where: { id: fresh.id },
        data: { status: "CANCELLED", respondedAt: now },
      });
      return { error: "INVITE_GONE" as const };
    }

    // A session code that isn't taken yet.
    let sessionCode = generateSessionCode();
    for (
      let i = 0;
      i < 5 &&
      (await tx.session.findUnique({
        where: { sessionCode },
        select: { id: true },
      }));
      i++
    ) {
      sessionCode = generateSessionCode();
    }

    // Played at the table of the person who said yes.
    const session = await tx.session.create({
      data: {
        tableId: fresh.to.tableId,
        sessionCode,
        mode: "TWO_PERSON",
        status: "READY",
      },
    });

    // Same first name twice would make "Linh, you're in the spotlight"
    // ambiguous — the inviter gets a small suffix.
    const inviterName =
      fresh.from.displayName.trim().toLowerCase() ===
      fresh.to.displayName.trim().toLowerCase()
        ? `${fresh.from.displayName} 2`
        : fresh.from.displayName;

    // Join order = spotlight order; the host (invitee) goes first.
    const hostPlayer = await tx.participant.create({
      data: {
        sessionId: session.id,
        displayName: fresh.to.displayName,
        participantToken: generateParticipantToken(),
        status: "WAITING",
        joinedAt: now,
      },
    });
    const guestPlayer = await tx.participant.create({
      data: {
        sessionId: session.id,
        displayName: inviterName,
        participantToken: generateParticipantToken(),
        status: "WAITING",
        joinedAt: new Date(now.getTime() + 1),
      },
    });

    const color = pickMeetColor();
    await tx.spillInvite.update({
      where: { id: fresh.id },
      data: {
        status: "ACCEPTED",
        respondedAt: now,
        sessionId: session.id,
        meetColor: color.name,
        meetCode: generateMeetCode(),
      },
    });
    await tx.openPresence.update({
      where: { id: fresh.to.id },
      data: {
        status: "MATCHED",
        sessionId: session.id,
        participantId: hostPlayer.id,
      },
    });
    await tx.openPresence.update({
      where: { id: fresh.from.id },
      data: {
        status: "MATCHED",
        sessionId: session.id,
        participantId: guestPlayer.id,
      },
    });

    // Neither of them is available any more.
    await tx.spillInvite.updateMany({
      where: {
        status: "PENDING",
        OR: [
          { fromId: { in: [fresh.from.id, fresh.to.id] } },
          { toId: { in: [fresh.from.id, fresh.to.id] } },
        ],
      },
      data: { status: "CANCELLED", respondedAt: now },
    });

    return { accepted: true as const, sessionCode };
  }, TX_OPTIONS);

  if ("error" in result) {
    return apiError(
      "INVITE_GONE",
      "This invite has expired or was cancelled.",
      409,
    );
  }
  if ("declined" in result) {
    return NextResponse.json({ ok: true, accepted: false });
  }
  return NextResponse.json({
    ok: true,
    accepted: true,
    sessionCode: result.sessionCode,
  });
}
