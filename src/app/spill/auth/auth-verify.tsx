"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

type Result =
  | { state: "working" }
  | { state: "ok"; connected: boolean; partnerName: string | null }
  | { state: "failed"; message: string };

export function AuthVerify() {
  const token = useSearchParams().get("token");
  const [result, setResult] = useState<Result>({ state: "working" });
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    if (!token) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setResult({ state: "failed", message: "This link is missing its code." });
      return;
    }
    (async () => {
      try {
        const res = await fetch("/api/auth/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });
        const json = await res.json().catch(() => ({}));
        if (!res.ok) {
          setResult({
            state: "failed",
            message: json.error?.message ?? "This link didn't work.",
          });
          return;
        }
        setResult({
          state: "ok",
          connected: !!json.connected,
          partnerName: json.partnerName ?? null,
        });
      } catch {
        setResult({
          state: "failed",
          message: "Connection issue — try again.",
        });
      }
    })();
  }, [token]);

  if (result.state === "working") {
    return (
      <div className="s42SetupHeading">
        <span>Stay connected</span>
        <h1>Signing you in…</h1>
      </div>
    );
  }

  if (result.state === "failed") {
    return (
      <>
        <div className="s42SetupHeading">
          <span>Stay connected</span>
          <h1>Link expired</h1>
          <p>{result.message}</p>
        </div>
        <Link className="s42Primary" href="/spill/me">
          Get a new link <span>→</span>
        </Link>
      </>
    );
  }

  return (
    <>
      <div className="s42SetupHeading">
        <span>Stay connected</span>
        <h1>You&apos;re in</h1>
        <p>
          {result.connected && result.partnerName
            ? `You and ${result.partnerName} are connected. Next time one of you is at SPILL and open to SPILL, the other will know.`
            : result.partnerName
              ? `Saved. As soon as ${result.partnerName} signs in too, you'll be connected.`
              : "You're signed in on this phone."}
        </p>
      </div>
      <Link className="s42Primary" href="/spill/me">
        Your SPILL connections <span>→</span>
      </Link>
    </>
  );
}
