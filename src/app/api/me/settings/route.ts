import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { settingsSchema } from "@/lib/validation/stay-connected";
import { apiError, readJson } from "@/lib/open-spill";
import { currentGuestId } from "@/lib/guest-auth";

// POST /api/me/settings  { emailNotifications?, notificationsPaused? }
export async function POST(req: NextRequest) {
  const guestId = await currentGuestId();
  if (!guestId) {
    return apiError("NOT_SIGNED_IN", "Not signed in.", 401);
  }
  const parsed = settingsSchema.safeParse(await readJson(req));
  if (!parsed.success) {
    return apiError("VALIDATION_ERROR", "Nothing to change.", 400);
  }
  const guest = await prisma.guest.update({
    where: { id: guestId },
    data: parsed.data,
    select: { emailNotifications: true, notificationsPaused: true },
  });
  return NextResponse.json({ ok: true, ...guest });
}
