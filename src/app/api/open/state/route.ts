import { NextRequest, NextResponse, after } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  INVITE_RESULT_SECONDS,
  apiError,
  blockedPresenceIds,
  expireStale,
  liveSince,
  meetColorByName,
  touchPresence,
} from "@/lib/open-spill";
import { connectionsOf, notifyConnectionsOpen } from "@/lib/stay-connected";
import { currentGuestId } from "@/lib/guest-auth";
import { siteOrigin } from "@/lib/spill-email";

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  if (!token) {
    return apiError("VALIDATION_ERROR", "token is required.", 400);
  }

  await expireStale();

  const me = await prisma.openPresence.findUnique({
    where: { presenceToken: token },
    include: {
      table: {
        select: {
          venueId: true,
          tableCode: true,
          displayName: true,
          venue: { select: { name: true } },
        },
      },
    },
  });
  if (!me) {
    return apiError("PRESENCE_NOT_FOUND", "You're not open to SPILL.", 404);
  }

  // Phase 3: opened first, signed in afterwards (same phone) → this spot now
  // belongs to that guest, and their connections hear about it once.
  if (!me.guestId && (me.status === "OPEN" || me.status === "PAUSED")) {
    const guestId = await currentGuestId();
    if (guestId) {
      const claimed = await prisma.openPresence.updateMany({
        where: { id: me.id, guestId: null },
        data: { guestId },
      });
      if (claimed.count === 1) {
        me.guestId = guestId;
        const origin = siteOrigin(req);
        after(() =>
          notifyConnectionsOpen({
            guestId,
            name: me.displayName,
            venueId: me.table.venueId,
            venueName: me.table.venue.name,
            origin,
          }).catch((err) => console.error("[open/state] notify failed", err)),
        );
      }
    }
  }

  const now = new Date();
  if (me.status === "OPEN" || me.status === "PAUSED") {
    await touchPresence(me.id);
  }

  const [incoming, outgoing, lastResult, acceptedInvite] = await Promise.all([
    prisma.spillInvite.findFirst({
      where: { toId: me.id, status: "PENDING" },
      orderBy: { createdAt: "asc" },
      include: {
        from: { select: { id: true, displayName: true, guestId: true } },
      },
    }),
    prisma.spillInvite.findFirst({
      where: { fromId: me.id, status: "PENDING" },
      include: { to: { select: { displayName: true } } },
    }),
    prisma.spillInvite.findFirst({
      where: {
        fromId: me.id,
        status: { in: ["DECLINED", "EXPIRED"] },
        OR: [
          {
            respondedAt: {
              gte: new Date(now.getTime() - INVITE_RESULT_SECONDS * 1000),
            },
          },
          {
            respondedAt: null,
            expiresAt: {
              gte: new Date(now.getTime() - INVITE_RESULT_SECONDS * 1000),
            },
          },
        ],
      },
      orderBy: { createdAt: "desc" },
      include: { to: { select: { displayName: true } } },
    }),
    me.status === "MATCHED" && me.sessionId
      ? prisma.spillInvite.findFirst({
          where: {
            sessionId: me.sessionId,
            status: "ACCEPTED",
            OR: [{ fromId: me.id }, { toId: me.id }],
          },
          include: {
            from: { select: { id: true, displayName: true } },
            to: { select: { id: true, displayName: true } },
            session: {
              select: {
                id: true,
                sessionCode: true,
                status: true,
                table: { select: { tableCode: true, displayName: true } },
              },
            },
          },
        })
      : Promise.resolve(null),
  ]);

  // Phase 3: my SPILL connections (only if I'm signed in) → the name I know
  // them by. People can type a different name each night, so when it differs
  // we say who they are: "You SPILLed before — as Toby".
  const knownName = new Map<string, string>(
    me.guestId
      ? (await connectionsOf(me.guestId)).map((c) => [c.otherGuestId, c.name])
      : [],
  );
  const knownAs = (guestId: string | null, shownName: string) => {
    const name = guestId ? knownName.get(guestId) : undefined;
    if (!name) return null;
    return name.trim().toLowerCase() === shownName.trim().toLowerCase()
      ? null
      : name;
  };

  // Available list — only while I'm open myself.
  let available: {
    id: string;
    displayName: string;
    openMinutes: number;
    busy: boolean;
    /** Phase 3: someone this guest chose to Stay Connected with. */
    isMatch: boolean;
    /** …and the name I know them by, when they're using a different one. */
    knownAs: string | null;
  }[] = [];
  if (me.status === "OPEN") {
    const declinedMe = await prisma.spillInvite.findMany({
      where: { fromId: me.id, status: "DECLINED" },
      select: { toId: true },
    });
    const hidden = new Set(declinedMe.map((d) => d.toId));
    for (const id of await blockedPresenceIds(me.id)) hidden.add(id);

    const others = await prisma.openPresence.findMany({
      where: {
        status: "OPEN",
        expiresAt: { gt: now },
        updatedAt: { gte: liveSince(now) },
        id: { not: me.id },
        table: { venueId: me.table.venueId },
      },
      orderBy: { createdAt: "asc" },
      take: 40,
      select: {
        id: true,
        displayName: true,
        createdAt: true,
        guestId: true,
        invitesGot: {
          where: { status: "PENDING" },
          select: { id: true },
          take: 1,
        },
      },
    });

    available = others
      .filter((o) => !hidden.has(o.id))
      .map((o) => ({
        id: o.id,
        displayName: o.displayName,
        openMinutes: Math.max(
          0,
          Math.floor((now.getTime() - o.createdAt.getTime()) / 60_000),
        ),
        busy: o.invitesGot.length > 0,
        isMatch: !!o.guestId && knownName.has(o.guestId),
        knownAs: knownAs(o.guestId, o.displayName),
      }))
      // People you already SPILLed with first.
      .sort((a, b) => Number(b.isMatch) - Number(a.isMatch));
  }

  let match = null;
  if (acceptedInvite?.session) {
    const iInvited = acceptedInvite.from.id === me.id;
    const partner = iInvited ? acceptedInvite.to : acceptedInvite.from;
    const participant = me.participantId
      ? await prisma.participant.findUnique({
          where: { id: me.participantId },
          select: { participantToken: true, displayName: true },
        })
      : null;
    const color = meetColorByName(acceptedInvite.meetColor);
    match = {
      partnerId: partner.id,
      partnerName: partner.displayName,
      // The inviter walks to the table of the person who said yes.
      iWalk: iInvited,
      meetTable: {
        code: acceptedInvite.session.table.tableCode,
        name: acceptedInvite.session.table.displayName,
      },
      color: { name: color.name, hex: color.hex, ink: color.ink },
      code: acceptedInvite.meetCode,
      session: {
        id: acceptedInvite.session.id,
        sessionCode: acceptedInvite.session.sessionCode,
        status: acceptedInvite.session.status,
      },
      participantToken: participant?.participantToken ?? null,
      playerName: participant?.displayName ?? me.displayName,
    };
  }

  return NextResponse.json({
    serverTime: now,
    me: {
      id: me.id,
      displayName: me.displayName,
      status: me.status,
      expiresAt: me.expiresAt,
      table: { code: me.table.tableCode, name: me.table.displayName },
    },
    available,
    incoming: incoming
      ? {
          id: incoming.id,
          fromId: incoming.from.id,
          fromName: incoming.from.displayName,
          knownAs: knownAs(incoming.from.guestId, incoming.from.displayName),
          expiresAt: incoming.expiresAt,
        }
      : null,
    outgoing: outgoing
      ? {
          id: outgoing.id,
          toName: outgoing.to.displayName,
          expiresAt: outgoing.expiresAt,
        }
      : null,
    notAvailable:
      lastResult && !outgoing ? { name: lastResult.to.displayName } : null,
    match,
  });
}
