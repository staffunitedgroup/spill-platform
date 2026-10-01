// Phase 3 · Stay Connected — who is signed in on this phone.
// A signed, httpOnly cookie: "<guestId>.<expiresAt>.<hmac>". No password ever.
import "server-only";
import {
  createHash,
  createHmac,
  randomBytes,
  timingSafeEqual,
} from "node:crypto";
import { cookies } from "next/headers";

export const GUEST_COOKIE = "spill_guest";
const MAX_AGE_DAYS = 90;
/** How long the emailed sign-in link works. */
export const LOGIN_LINK_MINUTES = 20;

function secret(): string | null {
  // Production needs its own SPILL_AUTH_SECRET (never shared, never in git).
  // Locally, the site secret is fine for testing. No secret → no sign-in at
  // all (fail closed), never a guessable default.
  const own = process.env.SPILL_AUTH_SECRET?.trim();
  if (own) return own;
  if (process.env.NODE_ENV !== "production") {
    return process.env.SITE_ACCESS_SECRET?.trim() || null;
  }
  return null;
}

function sign(payload: string, key: string) {
  return createHmac("sha256", key)
    .update(`spill-guest-v1:${payload}`)
    .digest("base64url");
}

function safeEqual(a: string, b: string) {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

export function authConfigured(): boolean {
  return secret() !== null;
}

/** The signed-in guest's id, or null. */
export async function currentGuestId(): Promise<string | null> {
  const key = secret();
  if (!key) return null;
  const raw = (await cookies()).get(GUEST_COOKIE)?.value;
  if (!raw) return null;
  const [guestId, exp, sig] = raw.split(".");
  if (!guestId || !exp || !sig) return null;
  if (!safeEqual(sig, sign(`${guestId}.${exp}`, key))) return null;
  if (Number(exp) < Date.now()) return null;
  return guestId;
}

export async function signIn(guestId: string) {
  const key = secret();
  if (!key)
    throw new Error("SPILL_AUTH_SECRET / SITE_ACCESS_SECRET is not set");
  const exp = Date.now() + MAX_AGE_DAYS * 24 * 60 * 60 * 1000;
  (await cookies()).set(
    GUEST_COOKIE,
    `${guestId}.${exp}.${sign(`${guestId}.${exp}`, key)}`,
    {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: MAX_AGE_DAYS * 24 * 60 * 60,
    },
  );
}

export async function signOut() {
  (await cookies()).delete(GUEST_COOKIE);
}

export function newLoginToken(): string {
  return randomBytes(32).toString("base64url");
}

export function hashLoginToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

/** "l***@gmail.com" — shown back to the guest, never to anyone else. */
export function maskEmail(email: string): string {
  const [name, domain] = email.split("@");
  return `${name.slice(0, 1)}${"*".repeat(Math.max(1, name.length - 1))}@${domain}`;
}
