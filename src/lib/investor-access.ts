import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";

export const investorCookieName = "spill_investor_access";

function secureEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
}

export function investorAccessConfigured() { return Boolean(process.env.INVESTOR_OVERVIEW_PASSWORD); }
export function validInvestorPassword(candidate: string) { const expected = process.env.INVESTOR_OVERVIEW_PASSWORD; return Boolean(expected) && secureEqual(candidate, expected as string); }
export function investorAccessToken() { const password = process.env.INVESTOR_OVERVIEW_PASSWORD ?? ""; const secret = process.env.INVESTOR_SESSION_SECRET || password; return createHmac("sha256", secret).update("spill-investor-overview-v1").digest("hex"); }
export function validInvestorAccessToken(candidate?: string) { return investorAccessConfigured() && Boolean(candidate) && secureEqual(candidate as string, investorAccessToken()); }
