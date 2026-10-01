import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiError } from "@/lib/open-spill";
import { currentGuestId } from "@/lib/guest-auth";
import { connectionsOf, hereTonight } from "@/lib/stay-connected";

// GET /api/me — the signed-in guest on this phone: settings, connections,
// and anyone they're connected with who is here tonight.
export async function GET() {
  const guestId = await currentGuestId();
  if (!guestId) {
    return apiError("NOT_SIGNED_IN", "Not signed in.", 401);
  }
  const guest = await prisma.guest.findUnique({
    where: { id: guestId },
    select: {
      email: true,
      displayName: true,
      emailNotifications: true,
      notificationsPaused: true,
    },
  });
  if (!guest) {
    return apiError("NOT_SIGNED_IN", "Not signed in.", 401);
  }

  const [connections, here] = await Promise.all([
    connectionsOf(guestId),
    hereTonight(guestId),
  ]);

  return NextResponse.json({
    guest,
    // Never send the other guest's id to the phone.
    connections: connections.map((c) => ({
      id: c.id,
      name: c.name,
      since: c.since,
      notify: c.notify,
    })),
    hereTonight: here,
  });
}
