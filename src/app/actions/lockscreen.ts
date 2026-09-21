"use server";

import { cookies } from "next/headers";
import { siteAccessToken, SITE_ACCESS_COOKIE, validSitePassword } from "@/lib/site-access";

export async function unlockSite(password: string): Promise<{ success: boolean; error?: string }> {
  const trimmed = (password || "").trim();
  if (!trimmed) {
    return { success: false, error: "Please enter the access password." };
  }

  if (!validSitePassword(trimmed)) {
    return { success: false, error: "Incorrect password. Access denied." };
  }

  const cookieStore = await cookies();
  cookieStore.set(SITE_ACCESS_COOKIE, siteAccessToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });

  return { success: true };
}
