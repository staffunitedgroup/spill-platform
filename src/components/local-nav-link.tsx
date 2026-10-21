"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

/**
 * A location menu link (Home, What's On, Book…) that shows when you're on its
 * page, and scrolls back to the top when tapped there — instead of seeming to
 * do nothing.
 */
export function LocalNavLink({ href, children, className }: { href: string; children: ReactNode; className?: string }) {
  const pathname = usePathname();
  const current = pathname === href;
  return <Link
    href={href}
    className={className}
    aria-current={current ? "page" : undefined}
    onClick={(event) => {
      if (!current) return;
      event.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }}
  >{children}</Link>;
}
