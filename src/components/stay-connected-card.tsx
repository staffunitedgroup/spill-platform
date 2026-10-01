"use client";

// Phase 3 · shown on the result screen ONLY when both chose Stay Connected.
// Signed in already → one tap. Otherwise → email, one-time link, no password.
import { useEffect, useState } from "react";
import Link from "next/link";

type Step = "checking" | "signedIn" | "email" | "sent" | "done" | "hidden";

export function StayConnectedCard({
  participantToken,
  partnerName,
  sessionCode,
}: {
  participantToken: string;
  partnerName: string;
  sessionCode: string;
}) {
  const [step, setStep] = useState<Step>("checking");
  const [email, setEmail] = useState("");
  const [sentTo, setSentTo] = useState("");
  const [devLink, setDevLink] = useState("");
  const [doneText, setDoneText] = useState("");
  const [error, setError] = useState("");
  const [working, setWorking] = useState(false);
  const dismissKey = `spill:${sessionCode}:stayConnectedDismissed`;

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        if (localStorage.getItem(dismissKey)) {
          if (!cancelled) setStep("hidden");
          return;
        }
      } catch {
        /* private mode */
      }
      try {
        const res = await fetch("/api/me", { cache: "no-store" });
        if (!cancelled) setStep(res.ok ? "signedIn" : "email");
      } catch {
        if (!cancelled) setStep("email");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [dismissKey]);

  function dismiss() {
    try {
      localStorage.setItem(dismissKey, "1");
    } catch {
      /* private mode */
    }
    setStep("hidden");
  }

  async function linkNow() {
    setWorking(true);
    setError("");
    try {
      const res = await fetch("/api/me/link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ participantToken }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(json.error?.message ?? "Couldn't save. Try again.");
        return;
      }
      setDoneText(
        json.connected
          ? `You and ${partnerName} are connected. We'll let you know when they're back at SPILL.`
          : `Saved. As soon as ${partnerName} says yes too, you'll be connected.`,
      );
      setStep("done");
    } catch {
      setError("Connection issue — try again.");
    } finally {
      setWorking(false);
    }
  }

  async function sendLink() {
    if (!email.trim()) return;
    setWorking(true);
    setError("");
    try {
      const res = await fetch("/api/auth/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), participantToken }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(json.error?.message ?? "Couldn't send. Try again.");
        return;
      }
      setSentTo(json.sentTo ?? email.trim());
      setDevLink(json.devLink ?? "");
      setStep("sent");
    } catch {
      setError("Connection issue — try again.");
    } finally {
      setWorking(false);
    }
  }

  if (step === "checking" || step === "hidden") return null;

  return (
    <div className="scCard">
      <span className="opKicker">Stay connected</span>

      {step === "done" ? (
        <>
          <h2>Saved</h2>
          <p>{doneText}</p>
          <Link className="scLink" href="/spill/me">
            Your SPILL connections →
          </Link>
        </>
      ) : step === "sent" ? (
        <>
          <h2>Check your email</h2>
          <p>
            We sent a sign-in link to <b>{sentTo}</b>. Tap it on this phone to
            stay connected with {partnerName}. It works for 20 minutes.
          </p>
          {devLink && (
            <a className="scLink" href={devLink}>
              Open sign-in link (testing only) →
            </a>
          )}
        </>
      ) : (
        <>
          <h2>Want to know when {partnerName} is back?</h2>
          <p>
            Next time one of you is at SPILL and open to SPILL, the other gets a
            nudge. No chat, no profile — just a reason to meet again.
          </p>

          {step === "signedIn" ? (
            <button
              className="s42Primary"
              type="button"
              disabled={working}
              onClick={linkNow}
            >
              {working ? "Saving…" : `Keep ${partnerName} as a connection`}{" "}
              <span>→</span>
            </button>
          ) : (
            <form
              className="scForm"
              onSubmit={(event) => {
                event.preventDefault();
                sendLink();
              }}
            >
              <input
                type="email"
                inputMode="email"
                autoComplete="email"
                value={email}
                placeholder="Your email"
                aria-label="Your email"
                onChange={(event) => setEmail(event.target.value)}
              />
              <button
                className="s42Primary"
                type="submit"
                disabled={working || !email.trim()}
              >
                {working ? "Sending…" : "Send my link"} <span>→</span>
              </button>
              <small>
                Only SPILL sees your email. {partnerName} never does.
              </small>
            </form>
          )}

          {error && <p className="scError">{error}</p>}

          <button className="opReportLink" type="button" onClick={dismiss}>
            No thanks
          </button>
        </>
      )}
    </div>
  );
}
