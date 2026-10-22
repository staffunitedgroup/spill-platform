import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";

export const SITE_ACCESS_COOKIE = "spill_site_access";

let warnedMissing = false;

function secureEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  return (
    leftBuffer.length === rightBuffer.length &&
    timingSafeEqual(leftBuffer, rightBuffer)
  );
}

export function getExpectedSitePassword(): string | null {
  const password = process.env.SITE_ACCESS_PASSWORD?.trim();
  if (!password) {
    if (!warnedMissing) {
      warnedMissing = true;
      console.error(
        "[site-access] SITE_ACCESS_PASSWORD is not set — the site stays locked for everyone.",
      );
    }
    return null;
  }
  return password;
}

export function siteAccessConfigured(): boolean {
  return getExpectedSitePassword() !== null;
}

export function validSitePassword(candidate: string): boolean {
  const expected = getExpectedSitePassword();
  return expected !== null && secureEqual(candidate, expected);
}

export function siteAccessToken(): string | null {
  const password = getExpectedSitePassword();
  if (!password) return null;
  const secret = process.env.SITE_ACCESS_SECRET?.trim() || password;
  return createHmac("sha256", secret)
    .update("spill-site-access-v1")
    .digest("hex");
}

export function hasValidSiteAccess(candidate?: string): boolean {
  const token = siteAccessToken();
  return Boolean(candidate && token) && secureEqual(candidate!, token!);
}

// ── Guest access (e.g. the marina team) ────────────────────────
// SITE_GUEST_PASSWORD opens the whole brand site but not the SPILL 42 app,
// which stays team-only. Remove or change it in Vercel (and redeploy) to switch
// guests off: their saved access stops working, the team password is untouched.

export type SiteAccess = "team" | "guest";

export function getGuestPassword(): string | null {
  const guest = process.env.SITE_GUEST_PASSWORD?.trim();
  const team = getExpectedSitePassword();
  // Never let a guest password double as the team one.
  if (!guest || !team || guest === team) return null;
  return guest;
}

function guestAccessToken(): string | null {
  const guest = getGuestPassword();
  const team = getExpectedSitePassword();
  if (!guest || !team) return null;
  const secret = process.env.SITE_ACCESS_SECRET?.trim() || team;
  // The guest password is part of the token, so changing it signs guests out.
  return createHmac("sha256", secret)
    .update(`spill-site-guest-v1:${guest}`)
    .digest("hex");
}

/** Which access a typed password gives (team, guest, or none). */
export function passwordAccess(candidate: string): SiteAccess | null {
  if (validSitePassword(candidate)) return "team";
  const guest = getGuestPassword();
  return guest && secureEqual(candidate, guest) ? "guest" : null;
}

export function accessToken(access: SiteAccess): string | null {
  return access === "team" ? siteAccessToken() : guestAccessToken();
}

/** Which access the visitor's saved cookie gives (team, guest, or none). */
export function siteAccessLevel(candidate?: string): SiteAccess | null {
  if (!candidate) return null;
  if (hasValidSiteAccess(candidate)) return "team";
  const guest = guestAccessToken();
  return guest && secureEqual(candidate, guest) ? "guest" : null;
}

// ── SPILL 42 app ───────────────────────────────────────────────
// The app (/spill-42 and /spill/…: scan a table, play, Your SPILL) needs the
// team password; guest access doesn't open it.
// Launch day: SPILL42_PUBLIC=true opens just these game pages to everyone
// while the rest of the site stays behind the private-access screen.

export function spill42Public(): boolean {
  return process.env.SPILL42_PUBLIC?.trim().toLowerCase() === "true";
}

export function isSpill42Path(pathname: string): boolean {
  return pathname === "/spill-42" || pathname.startsWith("/spill-42/") || pathname.startsWith("/spill/");
}
