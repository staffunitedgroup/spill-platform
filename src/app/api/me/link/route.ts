import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { linkPlayerSchema } from "@/lib/validation/stay-connected";
import { apiError, readJson } from "@/lib/open-spill";
import { currentGuestId } from "@/lib/guest-auth";
import { linkPlayerToGuest } from "@/lib/stay-connected";

// POST /api/me/link  { participantToken }
// Already signed in on this phone: save this game's Stay Connected in one tap.
export async function POST(req: NextRequest) {
  const guestId = await currentGuestId();
  if (!guestId) {
    return apiError("NOT_SIGNED_IN", "Not signed in.", 401);
  }
  const parsed = linkPlayerSchema.safeParse(await readJson(req));
  if (!parsed.success) {
    return apiError("VALIDATION_ERROR", "participantToken is required.", 400);
  }

  const player = await prisma.participant.findUnique({
    where: { participantToken: parsed.data.participantToken },
    select: { id: true, sessionId: true },
  });
  if (!player) {
    return apiError("PLAYER_NOT_FOUND", "That game wasn't found.", 404);
  }
  const players = await prisma.participant.findMany({
    where: { sessionId: player.sessionId },
    select: { wantsStayConnected: true },
  });
  if (
    players.length !== 2 ||
    !players.every((p) => p.wantsStayConnected === true)
  ) {
    return apiError(
      "NOT_MUTUAL",
      "Stay Connected needs both of you to choose it.",
      409,
    );
  }

  const result = await prisma.$transaction((tx) =>
    linkPlayerToGuest(tx, player.id, guestId),
  );
  return NextResponse.json({ ok: true, ...result });
}
