"use client";

import { useEffect } from "react";

const isGamePath = (path: string) =>
  path === "/spill-42" || path.startsWith("/spill-42/") || path.startsWith("/spill/");

/**
 * For guest access only (e.g. the marina team). A click on any link into the
 * SPILL 42 app opens it as a normal full page load instead of an in-site page
 * switch, so the site's access check runs and the team-only screen shows full
 * size straight away — no half-drawn page, footer or jump in between.
 */
export function GuestGameLinks() {
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const link = (event.target as HTMLElement | null)?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!link || (link.target && link.target !== "_self")) return;
      const url = new URL(link.href, window.location.href);
      if (url.origin !== window.location.origin || !isGamePath(url.pathname)) return;
      event.preventDefault();
      event.stopPropagation();
      window.location.assign(url.href);
    };
    // Capture phase: runs before Next.js' own link handling.
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);
  return null;
}
