// Phase 3 · Stay Connected — connections between signed-in guests, and the
// "they're back" notifications. No chat, ever: the only action is meeting.
import "server-only";
import { prisma } from "@/lib/prisma";
import { emailConfigured, emailHtml, sendEmail } from "@/lib/spill-email";
import { liveSince } from "@/lib/open-spill";

/** At most one "they're back" per connection per day (checklist). */
export const NOTIFY_EVERY_HOURS = 24;

type Tx = Parameters<Parameters<typeof prisma.$transaction>[0]>[0];

/**
 * A player from a finished game is now this guest. If both players of a
 * mutual Stay Connected are signed in, they become a saved connection.
 * Returns the partner's name when the connection exists.
 */
export async function linkPlayerToGuest(
  tx: Tx,
  participantId: string,
  guestId: string,
): Promise<{ connected: boolean; partnerName: string | null }> {
  const player = await tx.participant.findUnique({
    where: { id: participantId },
    select: { id: true, guestId: true, displayName: true, sessionId: true },
  });
  if (!player) return { connected: false, partnerName: null };

  // A player belongs to whoever signs in first from that phone.
  if (!player.guestId) {
    await tx.participant.update({
      where: { id: player.id },
      data: { guestId },
    });
  } else if (player.guestId !== guestId) {
    return { connected: false, partnerName: null };
  }
  await tx.guest.update({
    where: { id: guestId },
    data: { displayName: player.displayName },
  });

  return createConnectionIfMutual(tx, player.sessionId, guestId);
}

async function createConnectionIfMutual(
  tx: Tx,
  sessionId: string,
  myGuestId: string,
): Promise<{ connected: boolean; partnerName: string | null }> {
  const players = await tx.participant.findMany({
    where: { sessionId },
    select: { guestId: true, displayName: true, wantsStayConnected: true },
  });
  const mutual =
    players.length === 2 && players.every((p) => p.wantsStayConnected === true);
  if (!mutual) return { connected: false, partnerName: null };

  const partner = players.find((p) => p.guestId !== myGuestId) ?? null;
  const me = players.find((p) => p.guestId === myGuestId) ?? null;
  if (!partner || !me)
    return { connected: false, partnerName: partner?.displayName ?? null };
  if (!partner.guestId) {
    // They haven't signed in yet — the connection appears when they do.
    return { connected: false, partnerName: partner.displayName };
  }

  const [a, b] = [me, partner].sort((x, y) =>
    x.guestId! < y.guestId! ? -1 : 1,
  );
  await tx.spillConnection.upsert({
    where: {
      guestAId_guestBId: { guestAId: a.guestId!, guestBId: b.guestId! },
    },
    create: {
      guestAId: a.guestId!,
      guestBId: b.guestId!,
      nameA: a.displayName,
      nameB: b.displayName,
      sessionId,
    },
    // Met again and both chose Stay Connected again: refresh the names.
    update: { nameA: a.displayName, nameB: b.displayName, sessionId },
  });
  return { connected: true, partnerName: partner.displayName };
}

/** My connections, from my side: their id, the name I know them by, my mute. */
export async function connectionsOf(guestId: string) {
  const rows = await prisma.spillConnection.findMany({
    where: { OR: [{ guestAId: guestId }, { guestBId: guestId }] },
    orderBy: { createdAt: "desc" },
  });
  return rows.map((c) => {
    const iAmA = c.guestAId === guestId;
    return {
      id: c.id,
      otherGuestId: iAmA ? c.guestBId : c.guestAId,
      name: iAmA ? c.nameB : c.nameA,
      since: c.createdAt,
      notify: iAmA ? !c.mutedByA : !c.mutedByB,
    };
  });
}

/**
 * A signed-in guest just turned on "Open to SPILL". Tell each connection —
 * in the app, and by email if they allow it — unless they muted this person,
 * paused everything, or already heard about them in the last day.
 */
export async function notifyConnectionsOpen(opts: {
  guestId: string;
  name: string;
  venueId: string;
  venueName: string;
  origin: string;
}) {
  const since = new Date(Date.now() - NOTIFY_EVERY_HOURS * 60 * 60 * 1000);
  const rows = await prisma.spillConnection.findMany({
    where: { OR: [{ guestAId: opts.guestId }, { guestBId: opts.guestId }] },
    include: {
      guestA: {
        select: {
          id: true,
          email: true,
          emailNotifications: true,
          notificationsPaused: true,
        },
      },
      guestB: {
        select: {
          id: true,
          email: true,
          emailNotifications: true,
          notificationsPaused: true,
        },
      },
    },
  });

  let sent = 0;
  for (const c of rows) {
    const iAmA = c.guestAId === opts.guestId;
    const other = iAmA ? c.guestB : c.guestA;
    const otherMutedMe = iAmA ? c.mutedByB : c.mutedByA;
    const nameTheyKnow = iAmA ? c.nameA : c.nameB;
    if (otherMutedMe || other.notificationsPaused) continue;

    const recent = await prisma.spillNotification.findFirst({
      where: {
        aboutGuestId: opts.guestId,
        toGuestId: other.id,
        createdAt: { gte: since },
      },
      select: { id: true },
    });
    if (recent) continue;

    const note = await prisma.spillNotification.create({
      data: {
        toGuestId: other.id,
        aboutGuestId: opts.guestId,
        aboutName: nameTheyKnow,
        venueId: opts.venueId,
      },
    });
    sent++;

    if (other.emailNotifications && emailConfigured()) {
      const ok = await sendEmail({
        to: other.email,
        subject: `${nameTheyKnow} is at ${opts.venueName} now`,
        text: `${nameTheyKnow} is at ${opts.venueName} right now and open to SPILL.\n\nWant to SPILL again? Come by and scan the QR on any table.\n\nManage these emails: ${opts.origin}/spill/me`,
        html: emailHtml({
          heading: `${nameTheyKnow} is at ${opts.venueName} now`,
          body: `${nameTheyKnow} just turned on “Open to SPILL”. Want to SPILL again? Come by and scan the QR on any table — you'll see them in the list.`,
          cta: {
            label: "Your SPILL connections",
            href: `${opts.origin}/spill/me`,
          },
          footer:
            "You get at most one of these a day per person. Turn them off anytime from your SPILL connections page.",
        }),
      });
      if (ok) {
        await prisma.spillNotification.update({
          where: { id: note.id },
          data: { emailedAt: new Date() },
        });
      }
    }
  }
  return sent;
}

/**
 * "Linh, your SPILL match, is here tonight" — for the signed-in guest.
 * Worked out live from who is open right now (not from past emails), so it
 * shows every time Linh is open — even when the once-a-day email limit means
 * no new email went out. Hidden while Linh isn't open, if I removed her,
 * turned off "Tell me when they're back", or paused all notifications.
 */
export async function hereTonight(guestId: string) {
  const [me, connections] = await Promise.all([
    prisma.guest.findUnique({
      where: { id: guestId },
      select: { notificationsPaused: true },
    }),
    connectionsOf(guestId),
  ]);
  if (!me || me.notificationsPaused) return [];
  const wanted = connections.filter((c) => c.notify);
  if (wanted.length === 0) return [];

  const now = new Date();
  const open = await prisma.openPresence.findMany({
    where: {
      guestId: { in: wanted.map((c) => c.otherGuestId) },
      status: "OPEN",
      expiresAt: { gt: now },
      updatedAt: { gte: liveSince(now) },
    },
    orderBy: { createdAt: "desc" },
    select: { guestId: true, createdAt: true },
  });
  const since = new Map<string, Date>();
  for (const p of open) {
    if (p.guestId && !since.has(p.guestId)) since.set(p.guestId, p.createdAt);
  }
  return wanted
    .filter((c) => since.has(c.otherGuestId))
    .map((c) => ({
      id: c.id,
      name: c.name,
      at: since.get(c.otherGuestId)!,
      openNow: true,
    }));
}
