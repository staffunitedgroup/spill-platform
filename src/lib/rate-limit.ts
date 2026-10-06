/**
 * Light per-instance rate limit for public forms (same idea as /api/inquiries).
 * Not a hard guarantee on serverless — it just stops casual spam bursts.
 */
const buckets = new Map<string, number[]>();

export function rateLimited(key: string, max: number, windowMs = 10 * 60 * 1000) {
  const now = Date.now();
  const recent = (buckets.get(key) ?? []).filter((time) => now - time < windowMs);
  recent.push(now);
  buckets.set(key, recent);
  return recent.length > max;
}

export function clientIp(request: Request) {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
}
