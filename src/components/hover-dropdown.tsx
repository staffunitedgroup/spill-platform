"use client";

import { useEffect, useRef, useState, type MouseEvent, type ReactNode } from "react";
import Link from "next/link";

/** True on phones and tablets (no mouse to hover with). */
function isTouchLike() {
  return typeof window !== "undefined" && !window.matchMedia("(hover: hover) and (pointer: fine)").matches;
}

/**
 * Header dropdown (Locations, What's On, Create, the location switcher).
 *
 * - Mouse: opens on hover (CSS, see .dropdownPanel in globals.css).
 * - Touch (phones, iPad, Android tablets): a tap opens it, a second tap or a tap
 *   outside closes it. If the label is a link, the first tap opens the list and
 *   a second tap on the label goes to the page.
 * - Keyboard: Enter/Space on the toggle, Escape closes.
 *
 * Built from plain <button>s rather than <details>/<summary>: iOS Safari handled
 * a script-controlled <details> inconsistently, so taps did nothing on iPhone/iPad.
 */
export function HoverDropdown({ className, label, href, children }: { className: string; label: ReactNode; href?: string; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const outside = (event: Event) => {
      if (root.current && !root.current.contains(event.target as Node)) setOpen(false);
    };
    const escape = (event: KeyboardEvent) => { if (event.key === "Escape") setOpen(false); };
    document.addEventListener("pointerdown", outside);
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("pointerdown", outside);
      document.removeEventListener("keydown", escape);
    };
  }, [open]);

  function onLabelLinkClick(event: MouseEvent<HTMLAnchorElement>) {
    // On touch, the first tap on "What's On" shows its pages instead of leaving.
    if (!open && isTouchLike()) {
      event.preventDefault();
      setOpen(true);
    } else {
      setOpen(false);
    }
  }

  return <div
    ref={root}
    className={`${className}${open ? " isOpen" : ""}`}
    onMouseLeave={() => { if (!isTouchLike()) setOpen(false); }}
    onClick={(event) => {
      // Picked a page from the list: close it (the header can stay mounted across pages).
      if ((event.target as HTMLElement).closest(".dropdownPanel a")) setOpen(false);
    }}
  >
    {href
      ? <span className="dropdownHead">
          <Link href={href} onClick={onLabelLinkClick}>{label}</Link>
          <button type="button" className="dropdownCaret" aria-expanded={open} aria-label="Show pages" onClick={() => setOpen((was) => !was)}>⌄</button>
        </span>
      : <button type="button" className="dropdownHead" aria-expanded={open} onClick={() => setOpen((was) => !was)}>
          {label}
        </button>}
    {children}
  </div>;
}
