// Phase 2 · "Meet someone new" — shared rules for the Open / invite APIs.
import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";

/** "Open to SPILL" switches itself off after this long. */
export const OPEN_MINUTES = 45;
/** An unanswered invite expires after this long. */
export const INVITE_SECONDS = 120;
/** "Linh isn't available right now" stays on the inviter's screen this long. */
export const INVITE_RESULT_SECONDS = 60;
/** This many different people reporting someone hides them automatically. */
export const AUTO_HIDE_REPORTS = 2;

/**
 * Both phones show the same colour + code so the two people spot each other.
 * SPILL Saigon palette only; the 2-character code does the real matching.
 * `ink` = text colour that stays readable on top of the colour.
 */
export const MEET_COLORS = [
  { name: "Red", hex: "#E8472F", ink: "#111111" },
  { name: "Silver", hex: "#C0C4C8", ink: "#111111" },
  { name: "Deep red", hex: "#A82E22", ink: "#FFFFFF" },
] as const;

const CODE_LETTERS = "ACEFHJKMNPRTWXY";
const CODE_DIGITS = "2346789";

export function generatePresenceToken(): string {
  return randomBytes(24).toString("base64url");
}

function pick(chars: string): string {
  return chars[randomBytes(1)[0] % chars.length];
}

/** e.g. "K7" — short, easy to say out loud, no 0/O or 1/I confusion. */
export function generateMeetCode(): string {
  return pick(CODE_LETTERS) + pick(CODE_DIGITS);
}

export function pickMeetColor(): (typeof MEET_COLORS)[number] {
  return MEET_COLORS[randomBytes(1)[0] % MEET_COLORS.length];
}

export function meetColorByName(name: string | null) {
  return MEET_COLORS.find((c) => c.name === name) ?? MEET_COLORS[0];
}

/**
 * Lazily close everything that has timed out. Called at the start of every
 * Open / invite request, so no background job is needed.
 */
export async function expireStale(
  db: Pick<typeof prisma, "openPresence" | "spillInvite"> = prisma,
) {
  const now = new Date();
  await db.spillInvite.updateMany({
    where: { status: "PENDING", expiresAt: { lt: now } },
    data: { status: "EXPIRED" },
  });
  await db.openPresence.updateMany({
    where: { status: { in: ["OPEN", "PAUSED"] }, expiresAt: { lt: now } },
    data: { status: "CLOSED" },
  });
}

export function apiError(code: string, message: string, status: number) {
  return NextResponse.json({ error: { code, message } }, { status });
}

export async function readJson(req: Request): Promise<unknown | undefined> {
  try {
    return await req.json();
  } catch {
    return undefined;
  }
}

type TxLike = { $executeRaw: typeof prisma.$executeRaw };

export async function lockPresences(tx: TxLike, ids: string[]) {
  for (const id of [...new Set(ids)].sort()) {
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${id}))`;
  }
}

export const TX_OPTIONS = { maxWait: 10_000, timeout: 20_000 };

/**
 * Everyone this person must never see or be invited by again tonight:
 * people they reported, and people who reported them.
 */
export async function blockedPresenceIds(
  presenceId: string,
  db: Pick<typeof prisma, "spillReport"> = prisma,
): Promise<Set<string>> {
  const rows = await db.spillReport.findMany({
    // Open reports only: once staff resolve one, the two can see each other
    // again (taps by mistake happen).
    where: {
      status: "OPEN",
      OR: [{ reporterId: presenceId }, { reportedId: presenceId }],
    },
    select: { reporterId: true, reportedId: true },
  });
  return new Set(
    rows.map((r) =>
      r.reporterId === presenceId ? r.reportedId : r.reporterId,
    ),
  );
}
