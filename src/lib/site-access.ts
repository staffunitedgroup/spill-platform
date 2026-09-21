import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";

export const SITE_ACCESS_COOKIE = "spill_site_access";
export const DEFAULT_SITE_PASSWORD = "SpillSaigon@$";

function secureEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  return (
    leftBuffer.length === rightBuffer.length &&
    timingSafeEqual(leftBuffer, rightBuffer)
  );
}

export function getExpectedSitePassword(): string {
  return process.env.SITE_ACCESS_PASSWORD || DEFAULT_SITE_PASSWORD;
}

export function validSitePassword(candidate: string): boolean {
  const expected = getExpectedSitePassword();
  return Boolean(expected) && secureEqual(candidate, expected);
}

export function siteAccessToken(): string {
  const password = getExpectedSitePassword();
  const secret = process.env.SITE_ACCESS_SECRET || password;
  return createHmac("sha256", secret)
    .update("spill-site-access-v1")
    .digest("hex");
}

export function hasValidSiteAccess(candidate?: string): boolean {
  return (
    Boolean(candidate) && secureEqual(candidate as string, siteAccessToken())
  );
}
