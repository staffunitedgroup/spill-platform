import type { NextRequest } from "next/server";

/** Same check as the existing /api/admin routes: x-admin-password header. */
export function isAdmin(req: NextRequest): boolean {
  const password = req.headers.get("x-admin-password");
  return !!password && password === process.env.ADMIN_PASSWORD;
}
