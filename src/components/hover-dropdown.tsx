"use client";

import { useState, type ReactNode } from "react";

export function HoverDropdown({ className, summary, children }: { className: string; summary: ReactNode; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return <details
    className={className}
    open={open}
    onMouseEnter={() => setOpen(true)}
    onMouseLeave={() => setOpen(false)}
    onFocus={() => setOpen(true)}
    onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false); }}
    onToggle={(event) => setOpen(event.currentTarget.open)}
  ><summary>{summary}</summary>{children}</details>;
}
