"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

/** Guest-facing extras (footer, floating buttons) that don't belong on staff pages. */
export function HideOnAdmin({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  if (pathname === "/admin" || pathname?.startsWith("/admin/")) return null;
  return <>{children}</>;
}
