"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { SpillWordmark } from "@/components/brand-text";
import { loadMe, saveMe } from "@/lib/spill-device";
import "../../spill-game.css";

type SessionInfo = {
  id: string;
  sessionCode: string;
  status: string;
  maxParticipants: number;
  joined: string[];
};

export default function JoinPage() {
  const params = useParams<{ sessionCode: string }>();
  const router = useRouter();
  const sessionCode = params.sessionCode;

  const [session, setSession] = useState<SessionInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fatal, setFatal] = useState<string | null>(null);
  const [nickname, setNickname] = useState("");

  useEffect(() => {
    if (loadMe(sessionCode)) {
      router.replace(`/spill/${sessionCode}`);
      return;
    }
    async function init() {
      try {
        const res = await fetch(`/api/sessions/by-code/${sessionCode}`);
        const json = await res.json();
        if (!res.ok) {
          setFatal(
            "We couldn't find this table's SPILL. Ask a staff member for help.",
          );
          return;
        }
        const s = json.session;
        const max = s.mode === "GROUP" ? (s.groupSize ?? 6) : 2;
        const joined: string[] = (s.participants ?? []).map(
          (p: { displayName: string }) => p.displayName,
        );
        if (
          (s.status !== "WAITING" && s.status !== "READY") ||
          joined.length >= max
        ) {
          setFatal(
            "This table's SPILL is already in progress. Ask a staff member for help.",
          );
          return;
        }
        setSession({
          id: s.id,
          sessionCode: s.sessionCode,
          status: s.status,
          maxParticipants: max,
          joined,
        });
      } catch {
        setFatal("Something went wrong. Please try again.");
      } finally {
        setLoading(false);
      }
    }
    init();
  }, [sessionCode, router]);

  async function joinSession() {
    if (!session) return;
    const name = nickname.trim().slice(0, 20);
    if (!name) {
      setError("Tell the table what to call you.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/sessions/${session.id}/participants`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ displayName: name }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error?.message ?? "Couldn't join this SPILL.");
        setSubmitting(false);
        return;
      }
      saveMe({
        sessionId: session.id,
        sessionCode: session.sessionCode,
        token: json.participant.participantToken,
        name,
      });
      router.replace(`/spill/${sessionCode}`);
    } catch {
      setError("Something went wrong. Please try again.");
      setSubmitting(false);
    }
  }

  if (loading || fatal || !session) {
    return (
      <main className="s42App">
        <section className="s42Intro">
          <div className="s42IntroContent">
            {fatal ? (
              <>
                <h1>Can&apos;t join</h1>
                <span>{fatal}</span>
              </>
            ) : (
              <span>Loading…</span>
            )}
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="s42App">
      <section className="s42Setup">
        <div className="s42SetupPanel">
          <div className="s42SetupHeading">
            <span>
              {session.joined.length} of {session.maxParticipants} joined
            </span>
            <h1>
              Want to <SpillWordmark />?
            </h1>
            <p>What should the table call you?</p>
          </div>
          <form
            className="s42NameForm"
            onSubmit={(event) => {
              event.preventDefault();
              if (!submitting) joinSession();
            }}
          >
            <input
              type="text"
              value={nickname}
              maxLength={20}
              autoComplete="nickname"
              autoFocus
              placeholder="Your name or nickname"
              aria-label="Your name or nickname"
              onChange={(event) => setNickname(event.target.value)}
            />
            {session.joined.length > 0 && (
              <div className="s42JoinedList" aria-label="Already joined">
                {session.joined.map((name) => (
                  <span key={name}>{name}</span>
                ))}
              </div>
            )}
          </form>
          {error && <p className="s42Permission">{error}</p>}
          <button
            className="s42Primary"
            type="button"
            disabled={submitting || !nickname.trim()}
            onClick={joinSession}
          >
            {submitting
              ? "Joining…"
              : nickname.trim()
                ? `Join as ${nickname.trim()}`
                : "Enter your name"}{" "}
            <span>→</span>
          </button>
          <p className="s42Permission">
            Everyone plays on their own phone. Your choices stay private.
          </p>
        </div>
      </section>
    </main>
  );
}
