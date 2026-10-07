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

// ── SPILL 42 launch switch ─────────────────────────────────────
// While the site is private, SPILL42_PUBLIC=true opens just the game pages
// (/spill-42 and /spill/…) so guests scanning a table QR can play.
// Everything else stays behind the private-access screen.

export function spill42Public(): boolean {
  return process.env.SPILL42_PUBLIC?.trim().toLowerCase() === "true";
}

export function isSpill42Path(pathname: string): boolean {
  return pathname === "/spill-42" || pathname.startsWith("/spill-42/") || pathname.startsWith("/spill/");
}
