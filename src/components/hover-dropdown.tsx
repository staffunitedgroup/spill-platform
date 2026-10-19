"use client";

import { useRef, useState, type MouseEvent, type ReactNode } from "react";

// Opens on hover with a mouse, on tap with a finger, and on focus with a keyboard.
export function HoverDropdown({ className, summary, children }: { className: string; summary: ReactNode; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const pointer = useRef<string>("");

  function onSummaryClick(event: MouseEvent<HTMLElement>) {
    // A link inside the summary (e.g. "What's On") navigates as normal.
    if ((event.target as HTMLElement).closest("a")) return;
    // We control open/closed ourselves; the native toggle fights hover/focus on touch screens.
    event.preventDefault();
    setOpen((was) => (pointer.current === "mouse" ? true : !was));
  }

  return <details
    className={className}
    open={open}
    onPointerDown={(event) => { pointer.current = event.pointerType; }}
    // Pointer (not mouse) events: a tap also fires mouseenter, which would fight the tap toggle.
    onPointerEnter={(event) => { if (event.pointerType === "mouse") setOpen(true); }}
    onPointerLeave={(event) => { if (event.pointerType === "mouse") setOpen(false); }}
    onKeyDown={(event) => { if (event.key === "Escape") setOpen(false); }}
    onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false); }}
  ><summary onClick={onSummaryClick}>{summary}</summary>{children}</details>;
}
