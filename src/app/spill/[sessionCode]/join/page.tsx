"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { SpillWordmark } from "@/components/brand-text";

type StoredParticipant = { name: string; token: string };
type StoredSession = { sessionId: string; participants: StoredParticipant[] };

function loadStored(sessionCode: string): StoredSession | null {
  try {
    const raw = localStorage.getItem(`spill:${sessionCode}`);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    // Guard against leftover data from an older version of this app that
    // used a different shape ({ sessionId, participantToken }).
    if (
      !parsed ||
      typeof parsed !== "object" ||
      !Array.isArray(parsed.participants)
    ) {
      localStorage.removeItem(`spill:${sessionCode}`);
      return null;
    }
    return parsed as StoredSession;
  } catch {
    return null;
  }
}

function saveStored(sessionCode: string, data: StoredSession) {
  localStorage.setItem(`spill:${sessionCode}`, JSON.stringify(data));
}

export default function JoinPage() {
  const params = useParams<{ sessionCode: string }>();
  const router = useRouter();
  const sessionCode = params.sessionCode;

  const [sessionId, setSessionId] = useState<string | null>(null);
  const [participants, setParticipants] = useState<StoredParticipant[]>([]);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // "entry" = someone is about to type their name and join
  // "handoff" = participant 1 has joined, waiting to pass the phone to participant 2
  const [step, setStep] = useState<"entry" | "handoff">("entry");

  useEffect(() => {
    async function init() {
      const stored = loadStored(sessionCode);
      if (stored && stored.participants.length >= 2) {
        router.replace(`/spill/${sessionCode}`);
        return;
      }
      if (stored) {
        setSessionId(stored.sessionId);
        setParticipants(stored.participants);
        setStep(stored.participants.length === 1 ? "handoff" : "entry");
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`/api/sessions/by-code/${sessionCode}`);
        if (!res.ok) {
          setError(
            "We couldn't find this table's SPILL. Ask a staff member for help.",
          );
          setLoading(false);
          return;
        }
        const json = await res.json();
        const id = json.session?.id ?? json.id;
        setSessionId(id);
      } catch {
        setError("Something went wrong. Please try again.");
      }
      setLoading(false);
    }
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionCode]);

  async function joinSession() {
    if (!sessionId || !name.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/sessions/${sessionId}/participants`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ displayName: name.trim() }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error?.message ?? "Couldn't join this SPILL.");
        setSubmitting(false);
        return;
      }

      const updated = [
        ...participants,
        { name: name.trim(), token: json.participant.participantToken },
      ];
      setParticipants(updated);
      saveStored(sessionCode, { sessionId, participants: updated });
      setName("");
      setSubmitting(false);

      if (json.session.status === "READY" || updated.length >= 2) {
        router.replace(`/spill/${sessionCode}`);
      } else {
        setStep("handoff");
      }
    } catch {
      setError("Something went wrong. Please try again.");
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <main className="s42App">
        <section className="s42Intro">
          <div className="s42IntroContent">
            <span>Loading…</span>
          </div>
        </section>
      </main>
    );
  }

  if (error && !sessionId) {
    return (
      <main className="s42App">
        <section className="s42Intro">
          <div className="s42IntroContent">
            <h1>Something went wrong</h1>
            <span>{error}</span>
          </div>
        </section>
      </main>
    );
  }

  if (step === "handoff") {
    return (
      <main className="s42App">
        <section className="s42Setup">
          <div className="s42Handoff">
            <span>{participants[0]?.name} is in</span>
            <h1>Pass the phone</h1>
            <p>Participant 2, tap below when the screen is yours.</p>
            <button
              className="s42Primary"
              type="button"
              onClick={() => setStep("entry")}
            >
              I&apos;m Participant 2 <span>→</span>
            </button>
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
              {participants.length === 0 ? "Participant 1" : "Participant 2"}
            </span>
            <h1>
              Want to <SpillWordmark />?
            </h1>
            <p>Enter your name to join this table&apos;s SPILL.</p>
          </div>
          <label className="s42TableField">
            <span>Your name</span>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="e.g. Uyên"
              maxLength={40}
              onKeyDown={(event) => {
                if (event.key === "Enter") joinSession();
              }}
            />
          </label>
          {error && <p className="s42Permission">{error}</p>}
          <button
            className="s42Primary"
            type="button"
            disabled={!name.trim() || submitting}
            onClick={joinSession}
          >
            {submitting ? "Joining…" : "Continue"} <span>→</span>
          </button>
        </div>
      </section>
    </main>
  );
}
