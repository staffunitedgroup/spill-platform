"use client";

import { useEffect, useRef, useState, type MouseEvent, type ReactNode } from "react";

// Opens on hover with a mouse, on tap with a finger, and with Enter/Space on a keyboard.
// Open/closed lives in React state; the CSS only shows the panel when [open] is set
// (plus :hover for real mice), so phones never get stuck on a "sticky" hover.
export function HoverDropdown({ className, summary, children }: { className: string; summary: ReactNode; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const pointer = useRef<string>("");
  const root = useRef<HTMLDetailsElement>(null);

  // Tap/click anywhere outside closes it (iOS never blurs a tapped <summary>).
  useEffect(() => {
    if (!open) return;
    const close = (event: PointerEvent) => {
      if (root.current && !root.current.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, [open]);

  function onSummaryClick(event: MouseEvent<HTMLElement>) {
    // A link inside the summary (e.g. "What's On") navigates as normal.
    if ((event.target as HTMLElement).closest("a")) return;
    event.preventDefault();
    // With a mouse, hover already opened it — a click keeps it open.
    setOpen((was) => (pointer.current === "mouse" ? true : !was));
  }

  return <details
    ref={root}
    className={className}
    open={open}
    onPointerDown={(event) => { pointer.current = event.pointerType; }}
    // Pointer (not mouse) events: a tap also fires mouseenter, which would fight the tap toggle.
    onPointerEnter={(event) => { if (event.pointerType === "mouse") setOpen(true); }}
    onPointerLeave={(event) => { if (event.pointerType === "mouse") setOpen(false); }}
    onClick={(event) => {
      // Picked a page from the panel: close it (the header can stay mounted across pages).
      const link = (event.target as HTMLElement).closest("a");
      if (link && !link.closest("summary")) setOpen(false);
    }}
    onKeyDown={(event) => { if (event.key === "Escape") setOpen(false); }}
    onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false); }}
  ><summary onClick={onSummaryClick}>{summary}</summary>{children}</details>;
}
