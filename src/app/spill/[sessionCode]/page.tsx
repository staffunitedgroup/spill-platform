"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { BrandedText, SpillWordmark } from "@/components/brand-text";

type ConnectionType = "FRIENDS_ONLY" | "MAYBE_MORE" | "ALREADY_TOGETHER";
type SessionStatus = "WAITING" | "READY" | "ACTIVE" | "ENDING" | "ENDED";
type SessionMode = "TWO_PERSON" | "GROUP";
type SpillType =
  | "QUESTION"
  | "INSTRUCTION"
  | "CHALLENGE"
  | "OBSERVATION"
  | "SCENARIO"
  | "VISION";

type StoredParticipant = { name: string; token: string };
type StoredSession = {
  sessionId: string;
  mode: SessionMode;
  maxParticipants: number;
  participants: StoredParticipant[];
};

type CurrentSpillResponse = {
  session: { id: string; status: SessionStatus };
  currentSpill: {
    sequence: number;
    spill: { type: SpillType; content: string; category: string | null };
  } | null;
};

// Local UI phase — layered on top of the real session.status from the backend.
// Everyone shares ONE phone (per the SPILL 42 spec: "the phone facilitates,
// people connect"), so each private step is taken in turn on this same
// device, with a "pass the phone" handoff screen in between.
type Phase =
  | "loading"
  | "connectionOne"
  | "connectionHandoff"
  | "connectionTwo"
  | "spill"
  | "poolExhausted"
  | "ending"
  | "endingHandoff"
  | "result";

const CONNECTION_OPTIONS: {
  value: ConnectionType;
  label: string;
  note: string;
}[] = [
  { value: "FRIENDS_ONLY", label: "Friends only", note: "Keep it easy." },
  {
    value: "MAYBE_MORE",
    label: "Friends, maybe more",
    note: "Leave room for possibility.",
  },
  {
    value: "ALREADY_TOGETHER",
    label: "Already together",
    note: "Only when both choose it.",
  },
];

const connectionLabels: Record<ConnectionType, string> = {
  FRIENDS_ONLY: "Friends only",
  MAYBE_MORE: "Friends, maybe more",
  ALREADY_TOGETHER: "Already together",
};

const typeMarks: Record<SpillType, string> = {
  QUESTION: "?",
  INSTRUCTION: "↯",
  CHALLENGE: "◆",
  OBSERVATION: "◉",
  SCENARIO: "↗",
  VISION: "…",
};

const SPILL_PHRASES = [
  "Good things come to those who SPILL.",
  "Keep calm and SPILL on.",
  "When in doubt, SPILL it out.",
  "Live a little. SPILL a lot.",
  "The best is yet to SPILL.",
  "May the SPILL be with you.",
  "SPILL and you shall receive.",
];

const TOTAL_SPILLS = 42;

function loadStored(sessionCode: string): StoredSession | null {
  try {
    const raw = localStorage.getItem(`spill:${sessionCode}`);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (
      !parsed ||
      typeof parsed !== "object" ||
      !Array.isArray(parsed.participants) ||
      typeof parsed.maxParticipants !== "number"
    ) {
      return null;
    }
    return parsed as StoredSession;
  } catch {
    return null;
  }
}

export default function SpillSessionPage() {
  const params = useParams<{ sessionCode: string }>();
  const router = useRouter();
  const sessionCode = params.sessionCode;

  const [stored, setStored] = useState<StoredSession | null>(null);
  const [data, setData] = useState<CurrentSpillResponse | null>(null);
  const [phase, setPhase] = useState<Phase>("loading");
  const [actionLoading, setActionLoading] = useState(false);
  const [resolvedConnection, setResolvedConnection] =
    useState<ConnectionType | null>(null);
  const [mutual, setMutual] = useState<boolean | null>(null);
  const [endingIndex, setEndingIndex] = useState(0);
  const [handoffReady, setHandoffReady] = useState(false);
  const [savedIds, setSavedIds] = useState<number[]>([]);
  const [phrase] = useState(
    () => SPILL_PHRASES[Math.floor(Math.random() * SPILL_PHRASES.length)],
  );

  // Load who's on this device for this session.
  useEffect(() => {
    const saved = loadStored(sessionCode);
    if (!saved || saved.participants.length < saved.maxParticipants) {
      router.replace(`/spill/${sessionCode}/join`);
      return;
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setStored(saved);
  }, [sessionCode, router]);

  const fetchState = useCallback(async () => {
    if (!stored) return;
    const token = stored.participants[0]?.token;
    const res = await fetch(
      `/api/sessions/${stored.sessionId}/current-spill?participantToken=${encodeURIComponent(token ?? "")}`,
    );
    if (res.ok) {
      const json = await res.json();
      setData(json);
    }
  }, [stored]);

  useEffect(() => {
    if (!stored) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchState();
    const interval = setInterval(fetchState, 2000);
    return () => clearInterval(interval);
  }, [stored, fetchState]);

  // Drive the local UI phase from the real session status, only when we're
  // not already mid-way through a private, on-device step (connection pick,
  // ending pick) that the backend can't see happening in between.
  useEffect(() => {
    if (!data || !stored) return;
    if (phase === "loading") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (data.session.status === "READY") setPhase("connectionOne");
      else if (data.session.status === "ACTIVE") setPhase("spill");
      else if (data.session.status === "ENDED") setPhase("result");
    }
  }, [data, phase, stored]);

  useEffect(() => {
    if (phase === "connectionHandoff" || phase === "endingHandoff") {
      setHandoffReady(false);
      const timer = setTimeout(() => setHandoffReady(true), 1000);
      return () => clearTimeout(timer);
    }
  }, [phase]);

  if (!stored || (phase === "loading" && !data)) {
    return (
      <main className="s42App">
        <section className="s42Intro">
          <div className="s42IntroContent">
            <span>{phrase}</span>
          </div>
        </section>
      </main>
    );
  }

  const participants = stored.participants;
  const p1 = participants[0];
  const p2 = participants[1];

  async function submitConnection(
    participant: StoredParticipant,
    value: ConnectionType,
    isSecond: boolean,
  ) {
    if (!stored) return;
    setActionLoading(true);
    const res = await fetch(
      `/api/sessions/${stored.sessionId}/connection-selection`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          participantToken: participant.token,
          connectionType: value,
        }),
      },
    );
    const json = await res.json();
    setActionLoading(false);
    if (!res.ok) return;

    if (!isSecond) {
      setPhase("connectionHandoff");
    } else {
      if (json.session?.status === "ACTIVE") {
        setResolvedConnection(json.resolvedType ?? value);
      }
      setPhase("spill");
      fetchState();
    }
  }

  async function nextSpill() {
    if (!stored) return;
    setActionLoading(true);
    const res = await fetch(`/api/sessions/${stored.sessionId}/next-spill`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ participantToken: p1.token }),
    });
    if (res.ok) {
      const json = await res.json();
      if (json.exhausted) setPhase("poolExhausted");
    }
    setActionLoading(false);
    fetchState();
  }

  function startEnding() {
    setEndingIndex(0);
    setPhase("ending");
  }

  async function submitEnding(wantsStayConnected: boolean) {
    if (!stored) return;
    const participant = participants[endingIndex];
    setActionLoading(true);
    const res = await fetch(`/api/sessions/${stored.sessionId}/ending`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        participantToken: participant.token,
        wantsStayConnected,
      }),
    });
    const json = await res.json();
    setActionLoading(false);
    if (!res.ok) return;

    if (json.bothSubmitted) {
      setMutual(json.mutual ?? false);
      setPhase("result");
    } else {
      setEndingIndex((i) => i + 1);
      setPhase("endingHandoff");
    }
  }

  const index = data?.currentSpill?.sequence ?? 0;
  const currentEndingParticipant = participants[endingIndex];
  const nextEndingParticipant = participants[endingIndex];

  return (
    <main className="s42App">
      <header className="s42Header">
        <Link href="/" aria-label="Return to SPILL">
          <Image
            src="/assets/spill/brand/wordmark-bright.png"
            alt="SPILL"
            width={1580}
            height={250}
          />
        </Link>
        <strong>42</strong>
        <span />
      </header>

      {(phase === "connectionOne" || phase === "connectionTwo") && p1 && p2 && (
        <section className="s42Setup">
          <div className="s42SetupPanel private">
            <div className="s42PrivateBadge">
              Private choice · {phase === "connectionOne" ? p1.name : p2.name}
            </div>
            <div className="s42SetupHeading">
              <span>Choose connection</span>
              <h1>What feels right?</h1>
              <p>
                Choose privately. SPILL uses only the least intimate option you
                both selected.
              </p>
            </div>
            <div className="s42ChoiceGrid three">
              {CONNECTION_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  disabled={actionLoading}
                  onClick={() =>
                    submitConnection(
                      phase === "connectionOne" ? p1 : p2,
                      opt.value,
                      phase === "connectionTwo",
                    )
                  }
                >
                  <b>{opt.label}</b>
                  <small>{opt.note}</small>
                  <i>→</i>
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {phase === "connectionHandoff" && p2 && (
        <section className="s42Setup">
          <div className="s42Handoff">
            <span>Choice saved privately</span>
            <h1>Pass the phone</h1>
            <p>{p2.name}, tap below when the screen is yours.</p>
            <button
              className="s42Primary"
              type="button"
              disabled={!handoffReady}
              onClick={() => setPhase("connectionTwo")}
            >
              {handoffReady ? (
                <>
                  I&apos;m {p2.name} <span>→</span>
                </>
              ) : (
                "One moment…"
              )}
            </button>
          </div>
        </section>
      )}

      {phase === "spill" && (
        <section className="s42Dashboard">
          <div className="s42Play">
            <div className="s42PlayMeta">
              <span>
                {resolvedConnection
                  ? connectionLabels[resolvedConnection]
                  : stored.mode === "GROUP"
                    ? `${participants.length} people`
                    : `${p1.name} & ${p2?.name ?? ""}`}
              </span>
              <b>
                {index || "…"} / {TOTAL_SPILLS}
              </b>
            </div>
            {data?.currentSpill ? (
              <article className="s42Prompt" aria-live="polite">
                <span>
                  <b>{typeMarks[data.currentSpill.spill.type]}</b>
                  {data.currentSpill.spill.type}
                </span>
                <h1>
                  <BrandedText
                    text={data.currentSpill.spill.category ?? "SPILL"}
                  />
                </h1>
                <p>{data.currentSpill.spill.content.split("|||")[0]}</p>
                <i>—</i>
                <strong>
                  {data.currentSpill.spill.content.split("|||")[1]}
                </strong>
              </article>
            ) : (
              <article className="s42Prompt">
                <p>Getting your first SPILL ready…</p>
              </article>
            )}
            <div className="s42CardTools">
              <button
                className={
                  data?.currentSpill &&
                  savedIds.includes(data.currentSpill.sequence)
                    ? "saved"
                    : ""
                }
                type="button"
                disabled={!data?.currentSpill}
                onClick={() => {
                  const seq = data?.currentSpill?.sequence;
                  if (!seq) return;
                  setSavedIds((current) =>
                    current.includes(seq)
                      ? current.filter((id) => id !== seq)
                      : [...current, seq],
                  );
                }}
              >
                {data?.currentSpill &&
                savedIds.includes(data.currentSpill.sequence)
                  ? "Saved moment"
                  : "Remember this moment"}
              </button>
              <button
                type="button"
                disabled={actionLoading}
                onClick={startEnding}
              >
                End SPILL
              </button>
            </div>
            <div className="s42Progress">
              <span style={{ width: `${(index / TOTAL_SPILLS) * 100}%` }} />
            </div>
            <p className="s42Rhythm">Phone → People → Phone → People</p>
            <button
              className="s42Next"
              type="button"
              disabled={actionLoading}
              onClick={nextSpill}
            >
              {actionLoading ? "…" : "Next SPILL"} <span>→</span>
            </button>
          </div>
        </section>
      )}

      {phase === "poolExhausted" && (
        <section className="s42Result">
          <div className="s42ResultMark">42</div>
          <span>You&apos;ve SPILLed all 42!</span>
          <h1>That&apos;s every SPILL we have for now.</h1>
          <div className="s42ResultActions">
            <button className="s42Primary" type="button" onClick={startEnding}>
              Wrap up <span>→</span>
            </button>
          </div>
        </section>
      )}

      {phase === "ending" && currentEndingParticipant && (
        <section className="s42Ending">
          <div className="s42EndPanel">
            <div className="s42PrivateBadge">
              Private choice · {currentEndingParticipant.name}
            </div>
            <span>End on a positive note</span>
            <h1>What happens next?</h1>
            <p>
              SPILL confirms mutual connection. It never delivers rejection.
            </p>
            <div className="s42EndChoices">
              <button
                type="button"
                disabled={actionLoading}
                onClick={() => submitEnding(false)}
              >
                <b>SPILL Again</b>
                <small>
                  I&apos;d be open to SPILLing again, but for now I need to get
                  back.
                </small>
              </button>
              <button
                type="button"
                disabled={actionLoading}
                onClick={() => submitEnding(true)}
              >
                <b>Stay Connected</b>
                <small>I&apos;d like to exchange contact information.</small>
              </button>
            </div>
          </div>
        </section>
      )}

      {phase === "endingHandoff" && nextEndingParticipant && (
        <section className="s42Ending">
          <div className="s42Handoff">
            <span>Choice saved privately</span>
            <h1>Pass the phone</h1>
            <p>
              {nextEndingParticipant.name}, tap below when the screen is yours.
            </p>
            <button
              className="s42Primary"
              type="button"
              disabled={!handoffReady}
              onClick={() => setPhase("ending")}
            >
              {handoffReady ? (
                <>
                  I&apos;m {nextEndingParticipant.name} <span>→</span>
                </>
              ) : (
                "One moment…"
              )}
            </button>
          </div>
        </section>
      )}

      {phase === "result" && (
        <section className="s42Result">
          <div className="s42ResultMark">42</div>
          <span>Thanks for SPILLing</span>
          <h1>
            {mutual ? (
              <>
                Everyone chose
                <br />
                <em>Stay Connected</em>
              </>
            ) : (
              <>
                Maybe we&apos;ll
                <br />
                <em>
                  <SpillWordmark /> again
                </em>
              </>
            )}
          </h1>
          <p>
            {mutual
              ? "The feeling is mutual. Exchange details directly — and keep the connection human."
              : "No rejection screen. No match score. Just a real conversation that happened."}
          </p>
          <div className="s42Summary">
            <div>
              <strong>{index || TOTAL_SPILLS}</strong>
              <span>Moments reached</span>
            </div>
            <div>
              <strong>{savedIds.length}</strong>
              <span>Favorites saved</span>
            </div>
          </div>
          <blockquote>{phrase}</blockquote>
          <div className="s42ResultActions">
            <Link href="/">Return to SPILL</Link>
          </div>
        </section>
      )}
    </main>
  );
}
