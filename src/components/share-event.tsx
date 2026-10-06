"use client";

import { useState } from "react";

/** Share / copy link / add to calendar. Uses the phone's share sheet when there is one. */
export function ShareEvent({ path, title, calendarPath }: { path: string; title: string; calendarPath: string }) {
  const [copied, setCopied] = useState(false);

  function url() {
    return new URL(path, window.location.origin).toString();
  }

  async function share() {
    const link = url();
    if (navigator.share) {
      try {
        await navigator.share({ title, url: link });
        return;
      } catch {
        /* cancelled — fall through to copy */
      }
    }
    await copy();
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(url());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt("Copy this link:", url());
    }
  }

  return (
    <div className="shareEvent">
      <button type="button" onClick={share}>
        Share
      </button>
      <button type="button" onClick={copy}>
        {copied ? "Link copied ✓" : "Copy link"}
      </button>
      <a href={`https://wa.me/?text=${encodeURIComponent(title)}%20`} onClick={(e) => { e.currentTarget.href = `https://wa.me/?text=${encodeURIComponent(`${title} ${url()}`)}`; }} target="_blank" rel="noreferrer">
        WhatsApp
      </a>
      <a href={calendarPath}>Add to calendar</a>
    </div>
  );
}
