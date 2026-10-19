"use client";

import { useEffect, useRef, type ReactNode } from "react";
import Link from "next/link";

/** The ☰ menu on phones. Closes after a link is tapped, or on a tap outside it. */
export function MobileMenu({ className = "", label, children }: { className?: string; label: string; children: ReactNode }) {
  const root = useRef<HTMLDetailsElement>(null);

  useEffect(() => {
    const close = (event: PointerEvent) => {
      const menu = root.current;
      if (menu?.open && !menu.contains(event.target as Node)) menu.open = false;
    };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, []);

  return <details
    ref={root}
    className={`mobileMenu ${className}`.trim()}
    onClick={(event) => {
      if ((event.target as HTMLElement).closest("nav a") && root.current) root.current.open = false;
    }}
  >
    <summary aria-label={label}><span /><span /></summary>
    {children}
  </details>;
}

type GroupItem = { label: string; href: string; note?: string; current?: boolean; className?: string };

/**
 * A menu item with sub-pages: tapping it opens the list underneath
 * (it used to jump straight to the parent page).
 */
export function MobileNavGroup({ label, href, overview, items }: { label: string; href?: string; overview?: string; items: GroupItem[] }) {
  return <details className="mobileGroup">
    <summary>{label}<svg className="mobileChevron" viewBox="0 0 20 20" aria-hidden="true"><path d="m5 8 5 5 5-5" /></svg></summary>
    <div className="mobileGroupItems">
      {href && <Link href={href} className="mobileGroupOverview">{overview ?? `All of ${label}`}</Link>}
      {items.map((item) => <Link key={`${item.label}-${item.href}`} href={item.href} className={item.className} aria-current={item.current ? "page" : undefined}>
        <span>{item.label}</span>{item.note && <small>{item.note}</small>}
      </Link>)}
    </div>
  </details>;
}
