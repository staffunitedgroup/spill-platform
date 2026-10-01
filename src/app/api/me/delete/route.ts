import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiError } from "@/lib/open-spill";
import { currentGuestId, signOut } from "@/lib/guest-auth";

// POST /api/me/delete — forget me: email, connections and notifications go.
// Past games stay (they never held the email), just unlinked.
export async function POST() {
  const guestId = await currentGuestId();
  if (!guestId) {
    return apiError("NOT_SIGNED_IN", "Not signed in.", 401);
  }
  const guest = await prisma.guest.findUnique({
    where: { id: guestId },
    select: { email: true },
  });
  await prisma.$transaction([
    ...(guest
      ? [prisma.loginToken.deleteMany({ where: { email: guest.email } })]
      : []),
    prisma.guest.deleteMany({ where: { id: guestId } }),
  ]);
  await signOut();
  return NextResponse.json({ ok: true });
}
