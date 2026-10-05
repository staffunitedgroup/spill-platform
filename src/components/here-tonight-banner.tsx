"use client";

// Phase 3 · "Minh, your SPILL match, is here tonight."
// Shown to a signed-in guest when they scan a table QR (their check-in).
import { useEffect, useState } from "react";
import Link from "next/link";

type Here = { id: string; name: string; at: string; openNow: boolean };

export function HereTonightBanner({
  tableCode,
  showOpenLink = true,
}: {
  tableCode: string;
  showOpenLink?: boolean;
}) {
  // null = still checking · "signedOut" = no account on this phone yet
  const [here, setHere] = useState<Here[] | "signedOut" | null>(null);

  useEffect(() => {
    let cancelled = false;
    const timer: { id?: ReturnType<typeof setInterval> } = {};
    const load = async () => {
      try {
        const res = await fetch("/api/me", { cache: "no-store" });
        if (res.status === 401) {
          // Not signed in on this phone — still show the way to "Your SPILL",
          // and stop asking (nothing will change until they sign in).
          if (!cancelled) setHere("signedOut");
          clearInterval(timer.id);
          return;
        }
        if (!res.ok) return;
        const json = await res.json();
        if (!cancelled) setHere(json.hereTonight ?? []);
      } catch {
        /* quiet */
      }
    };
    load();
    // Someone may arrive while this screen is open — check again now and then.
    timer.id = setInterval(load, 15_000);
    return () => {
      cancelled = true;
      clearInterval(timer.id);
    };
  }, []);

  if (!here) return null;

  if (here === "signedOut") {
    return (
      <p className="htQuiet">
        <Link href="/spill/me">Your SPILL · Sign in</Link>
      </p>
    );
  }

  if (here.length === 0) {
    return (
      <p className="htQuiet">
        <Link href="/spill/me">Your SPILL</Link>
      </p>
    );
  }

  return (
    <div className="htBanner" role="status">
      {here.map((h) => (
        <p key={h.id}>
          <b>{h.name}</b>, your SPILL match, is here tonight
          {h.openNow ? " and open to SPILL." : "."}
        </p>
      ))}
      <div className="htActions">
        {showOpenLink && here.some((h) => h.openNow) && (
          <Link className="htCta" href={`/spill/table/${tableCode}/open`}>
            Find them in Meet someone new →
          </Link>
        )}
        <Link className="htMore" href="/spill/me">
          Your connections
        </Link>
      </div>
    </div>
  );
}
