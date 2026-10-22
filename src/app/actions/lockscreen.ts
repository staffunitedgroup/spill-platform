"use server";

import { cookies } from "next/headers";
import {
  accessToken,
  passwordAccess,
  SITE_ACCESS_COOKIE,
} from "@/lib/site-access";

/**
 * Checks the password and saves the access it gives (team or guest).
 * `teamOnly` is set on the SPILL 42 screen, where a guest password can't help:
 * the visitor gets a clear message instead of a page that just reloads.
 */
export async function unlockSite(
  password: string,
  teamOnly = false,
): Promise<{ success: boolean; error?: string }> {
  const trimmed = (password || "").trim();
  if (!trimmed) {
    return { success: false, error: "Please enter the access password." };
  }

  const access = passwordAccess(trimmed);
  if (!access) {
    return { success: false, error: "Incorrect password. Access denied." };
  }
  if (teamOnly && access !== "team") {
    return {
      success: false,
      error: "This password opens the SPILL website, but not the SPILL 42 app.",
    };
  }

  const token = accessToken(access);
  if (!token) {
    // Only reachable if SITE_ACCESS_PASSWORD is missing (then nothing validates).
    return { success: false, error: "Access is not configured yet." };
  }

  const cookieStore = await cookies();
  cookieStore.set(SITE_ACCESS_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });

  return { success: true };
}
