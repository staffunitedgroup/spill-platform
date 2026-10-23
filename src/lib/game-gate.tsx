import "server-only";
import type { ReactNode } from "react";
import { cookies } from "next/headers";
import { SITE_ACCESS_COOKIE, siteAccessLevel, spill42Public } from "@/lib/site-access";
import { FullReload } from "@/components/full-reload";

/**
 * Guards the SPILL 42 app (/spill-42 and /spill/…) for every way in.
 *
 * The root layout already checks access on a full page load, but Next.js does
 * not re-run the root layout when someone clicks a link inside the site — so a
 * guest (e.g. the marina team) could reach the game from a menu link. These
 * segment layouts run on every navigation into the game, from anywhere.
 *
 * Team access, or the launch-day switch (SPILL42_PUBLIC=true), lets people in.
 */
export async function GameGate({ children }: { children: ReactNode }) {
  if (spill42Public()) return children;
  const access = siteAccessLevel((await cookies()).get(SITE_ACCESS_COOKIE)?.value);
  if (access === "team") return children;
  // Only reached by a click from inside the site (a full page load is already
  // stopped by the root layout): reload so that screen shows, full size.
  return <FullReload />;
}
