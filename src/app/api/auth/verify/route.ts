import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyLinkSchema } from "@/lib/validation/stay-connected";
import { apiError, readJson } from "@/lib/open-spill";
import { hashLoginToken, signIn } from "@/lib/guest-auth";
import { linkPlayerToGuest } from "@/lib/stay-connected";

// POST /api/auth/verify  { token }
// Called by the /spill/auth page (a POST, so email link scanners that only
// "visit" the link can't use it up). One use, 20 minutes.
export async function POST(req: NextRequest) {
  const parsed = verifyLinkSchema.safeParse(await readJson(req));
  if (!parsed.success) {
    return apiError("VALIDATION_ERROR", "This link isn't valid.", 400);
  }

  const now = new Date();
  const result = await prisma.$transaction(async (tx) => {
    const login = await tx.loginToken.findUnique({
      where: { tokenHash: hashLoginToken(parsed.data.token) },
    });
    if (!login || login.usedAt || login.expiresAt <= now) {
      return { ok: false as const };
    }
    // Claim it atomically: a second tab can't use the same link.
    const claimed = await tx.loginToken.updateMany({
      where: { id: login.id, usedAt: null },
      data: { usedAt: now },
    });
    if (claimed.count === 0) return { ok: false as const };

    const guest = await tx.guest.upsert({
      where: { email: login.email },
      create: { email: login.email },
      update: {},
    });

    const link = login.participantId
      ? await linkPlayerToGuest(tx, login.participantId, guest.id)
      : { connected: false, partnerName: null };

    return { ok: true as const, guestId: guest.id, ...link };
  });

  if (!result.ok) {
    return apiError(
      "LINK_EXPIRED",
      "This link has expired or was already used. Ask for a new one.",
      410,
    );
  }

  await signIn(result.guestId);
  return NextResponse.json({
    ok: true,
    connected: result.connected,
    partnerName: result.partnerName,
  });
}
