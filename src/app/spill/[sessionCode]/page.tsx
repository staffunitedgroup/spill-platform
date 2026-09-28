"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { BrandedText, SpillWordmark } from "@/components/brand-text";
import {
  HeatMeter,
  LevelUp,
  SpillTimer,
  SpotlightRoulette,
  Toast,
  TwistReveal,
  TypeIcon,
  buzz,
} from "@/components/spill-game-ui";
import {
  PASSES_PER_PLAYER,
  STREAK_MILESTONES,
  TOTAL_SPILLS,
  createGameState,
  fillName,
  getForfeit,
  getHeat,
  getLevel,
  getTimerSeconds,
  getTwist,
  isLevelStart,
  pickSpotlight,
  summarize,
  type CardRecord,
  type GameState,
  type SpillType,
  type Twist,
} from "@/lib/spill-engine/game-rules";
import "../spill-game.css";

type ConnectionType = "FRIENDS_ONLY" | "MAYBE_MORE" | "ALREADY_TOGETHER";
type SessionStatus = "WAITING" | "READY" | "ACTIVE" | "ENDING" | "ENDED";
type SessionMode = "TWO_PERSON" | "GROUP";

type StoredParticipant = { name: string; token: string };
type StoredSession = {
  sessionId: string;
  mode: SessionMode;
  maxParticipants: number;
  participants: StoredParticipant[];
};

type SessionSpillPayload = {
  sequence: number;
  spill: { type: SpillType; content: string; category: string | null };
};

type CurrentSpillResponse = {
  session: {
    id: string;
    status: SessionStatus;
    participants?: { wantsStayConnected: boolean | null }[];
  };
  resolvedConnectionType?: ConnectionType | null;
  currentSpill: SessionSpillPayload | null;
};

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

type Stage = "levelUp" | "drawing" | "twist" | "card" | "forfeit";

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

const typeLabels: Record<SpillType, string> = {
  QUESTION: "Ask",
  INSTRUCTION: "Do",
  CHALLENGE: "Dare",
  OBSERVATION: "Notice",
  SCENARIO: "Predict",
  VISION: "Imagine",
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

function gameKey(sessionCode: string) {
  return `spill:${sessionCode}:game`;
}

function loadGame(sessionCode: string, playerCount: number): GameState {
  try {
    const raw = localStorage.getItem(gameKey(sessionCode));
    if (raw) {
      const parsed = JSON.parse(raw) as GameState;
      if (parsed?.version === 1 && Array.isArray(parsed.cards)) return parsed;
    }
  } catch {
    /* ignore */
  }
  return createGameState(playerCount);
}

function saveGame(sessionCode: string, state: GameState) {
  try {
    localStorage.setItem(gameKey(sessionCode), JSON.stringify(state));
  } catch {
    /* private mode etc. — the game still works in memory */
  }
}

function splitContent(content: string) {
  const [text, follow] = content.split("|||");
  return { text: text ?? content, follow: follow ?? "" };
}

export default function SpillSessionPage() {
  const params = useParams<{ sessionCode: string }>();
  const router = useRouter();
  const sessionCode = params.sessionCode;

  const [stored, setStored] = useState<StoredSession | null>(null);
  const [data, setData] = useState<CurrentSpillResponse | null>(null);
  const [phase, setPhase] = useState<Phase>("loading");
  const [stage, setStage] = useState<Stage>("card");
  const [actionLoading, setActionLoading] = useState(false);
  const [mutual, setMutual] = useState<boolean | null>(null);
  const [endingIndex, setEndingIndex] = useState(0);
  const [readyForPhase, setReadyForPhase] = useState<Phase | null>(null);
  const [game, setGame] = useState<GameState | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [forfeit, setForfeit] = useState<{ name: string; text: string } | null>(
    null,
  );
  const autoDrawRef = useRef(false);
  const [phrase] = useState(
    () => SPILL_PHRASES[Math.floor(Math.random() * SPILL_PHRASES.length)],
  );

  useEffect(() => {
    const saved = loadStored(sessionCode);
    if (!saved || saved.participants.length < saved.maxParticipants) {
      router.replace(`/spill/${sessionCode}/join`);
      return;
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setStored(saved);
    setGame(loadGame(sessionCode, saved.participants.length));
  }, [sessionCode, router]);

  useEffect(() => {
    if (game) saveGame(sessionCode, game);
  }, [game, sessionCode]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2600);
    return () => clearTimeout(t);
  }, [toast]);

  const fetchState = useCallback(async () => {
    if (!stored) return;
    const token = stored.participants[0]?.token;
    try {
      const res = await fetch(
        `/api/sessions/${stored.sessionId}/current-spill?participantToken=${encodeURIComponent(token ?? "")}`,
      );
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch {}
  }, [stored]);

  useEffect(() => {
    if (!stored) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchState();
    const interval = setInterval(fetchState, 4000);
    return () => clearInterval(interval);
  }, [stored, fetchState]);

  useEffect(() => {
    if (!data || !stored) return;
    if (phase === "loading") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (data.session.status === "READY") setPhase("connectionOne");
      else if (data.session.status === "ACTIVE") setPhase("spill");
      else if (
        data.session.status === "ENDING" ||
        data.session.status === "ENDED"
      )
        setPhase("result");
    }
  }, [data, phase, stored]);

  useEffect(() => {
    if (phase === "connectionHandoff" || phase === "endingHandoff") {
      const timer = setTimeout(() => setReadyForPhase(phase), 1000);
      return () => clearTimeout(timer);
    }
  }, [phase]);

  const registerCard = useCallback(
    (sessionSpill: SessionSpillPayload, animate: boolean) => {
      if (!stored) return;
      const seq = sessionSpill.sequence;
      setGame((current) => {
        if (!current || current.cards.some((c) => c.sequence === seq)) {
          return current;
        }
        const history = current.cards.map((c) => c.spotlight);
        const prev = current.cards[current.cards.length - 1];
        const spotlight = pickSpotlight(
          stored.sessionId,
          seq,
          stored.participants.length,
          history,
        );
        const twist = getTwist(
          stored.sessionId,
          seq,
          stored.mode,
          Boolean(prev?.twist),
        );
        const { text } = splitContent(sessionSpill.spill.content);
        const record: CardRecord = {
          sequence: seq,
          type: sessionSpill.spill.type,
          title: sessionSpill.spill.category ?? "SPILL",
          text,
          spotlight,
          twist: twist?.id ?? null,
          passed: false,
        };
        return { ...current, cards: [...current.cards, record] };
      });
      if (animate) {
        setStage(isLevelStart(seq) ? "levelUp" : "drawing");
      } else {
        setStage("card");
      }
    },
    [stored],
  );

  const advance = useCallback(async () => {
    if (!stored || actionLoading) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/sessions/${stored.sessionId}/next-spill`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          participantToken: stored.participants[0].token,
          currentSequence: data?.currentSpill?.sequence ?? 0,
        }),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.exhausted) {
          buzz([80, 60, 80, 60, 240]);
          setPhase("poolExhausted");
        } else if (json.currentSpill) {
          setData((d) => (d ? { ...d, currentSpill: json.currentSpill } : d));
          registerCard(json.currentSpill, true);
        }
      }
    } finally {
      setActionLoading(false);
      fetchState();
    }
  }, [stored, actionLoading, data, registerCard, fetchState]);

  useEffect(() => {
    if (phase !== "spill" || !data || !game) return;
    if (data.session.status !== "ACTIVE") return;
    const current = data.currentSpill;
    if (current) {
      if (!game.cards.some((c) => c.sequence === current.sequence)) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        registerCard(current, game.cards.length === 0);
      }
      return;
    }
    if (game.cards.length >= TOTAL_SPILLS) {
      setPhase("poolExhausted");
      return;
    }
    if (game.cards.length === 0 && !autoDrawRef.current) {
      autoDrawRef.current = true;
      advance();
    }
  }, [phase, data, game, registerCard, advance]);

  if (!stored || !game || (phase === "loading" && !data)) {
    return (
      <main className="s42App">
        <section className="s42Intro">
          <div className="s42IntroContent">
            <span suppressHydrationWarning>{phrase}</span>
          </div>
        </section>
      </main>
    );
  }

  const participants = stored.participants;
  const names = participants.map((p) => p.name);
  const handoffReady = readyForPhase === phase;
  const p1 = participants[0];
  const p2 = participants[1];
  const resolvedConnection = data?.resolvedConnectionType ?? null;

  const currentSpill = data?.currentSpill ?? null;
  const index = currentSpill?.sequence ?? game.cards.length;
  const record = currentSpill
    ? game.cards.find((c) => c.sequence === currentSpill.sequence)
    : undefined;
  const prevRecord = record
    ? game.cards.find((c) => c.sequence === record.sequence - 1)
    : undefined;
  const twist: Twist | null =
    record && record.twist
      ? getTwist(
          stored.sessionId,
          record.sequence,
          stored.mode,
          Boolean(prevRecord?.twist),
        )
      : null;
  const spotlightName = record ? names[record.spotlight] : names[0];
  const level = getLevel(Math.max(1, index));
  const heat = getHeat(game.streak, Math.max(1, index));
  const passesLeft = record
    ? PASSES_PER_PLAYER - (game.passesUsed[record.spotlight] ?? 0)
    : 0;
  const timerSeconds = currentSpill
    ? getTimerSeconds(currentSpill.spill.type, twist)
    : null;
  const content = currentSpill
    ? splitContent(currentSpill.spill.content)
    : null;
  const isSaved = currentSpill
    ? game.saved.includes(currentSpill.sequence)
    : false;

  function afterRoulette() {
    setStage(twist ? "twist" : "card");
  }

  function answerAndNext() {
    if (!game || !currentSpill) {
      advance();
      return;
    }
    const streak = game.streak + 1;
    setGame({
      ...game,
      streak,
      bestStreak: Math.max(game.bestStreak, streak),
    });
    if (STREAK_MILESTONES.includes(streak)) {
      setToast(`${streak} in a row — the heat is rising`);
      buzz([40, 30, 40]);
    } else if (currentSpill.sequence === Math.floor(TOTAL_SPILLS / 2)) {
      setToast("Halfway there. Keep SPILLing.");
    }
    advance();
  }

  function pass() {
    if (!game || !record || passesLeft <= 0 || !stored) return;
    const passesUsed = [...game.passesUsed];
    passesUsed[record.spotlight] = (passesUsed[record.spotlight] ?? 0) + 1;
    setGame({
      ...game,
      streak: 0,
      passesUsed,
      cards: game.cards.map((c) =>
        c.sequence === record.sequence ? { ...c, passed: true } : c,
      ),
    });
    setForfeit({
      name: spotlightName,
      text: getForfeit(stored.sessionId, record.sequence),
    });
    setStage("forfeit");
    buzz([150]);
  }

  function toggleSaved() {
    if (!game || !currentSpill) return;
    const seq = currentSpill.sequence;
    setGame({
      ...game,
      saved: game.saved.includes(seq)
        ? game.saved.filter((s) => s !== seq)
        : [...game.saved, seq],
    });
  }

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
    setActionLoading(false);
    if (!res.ok) return;

    if (!isSecond) {
      setReadyForPhase(null);
      setPhase("connectionHandoff");
    } else {
      setPhase("spill");
      fetchState();
    }
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
      buzz([60, 40, 60]);
    } else {
      setEndingIndex((i) => i + 1);
      setReadyForPhase(null);
      setPhase("endingHandoff");
    }
  }

  const currentEndingParticipant = participants[endingIndex];
  const summary = summarize(game, participants.length);
  const savedCards = game.cards.filter((c) => game.saved.includes(c.sequence));
  const isMutual =
    mutual ??
    (data?.session.participants?.length
      ? data.session.participants.every((p) => p.wantsStayConnected === true)
      : false);

  return (
    <main
      className={`s42App sgApp sgLevel${level.number}`}
      style={{ "--lvl": level.color, "--heat": heat / 100 } as CSSProperties}
    >
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

      <Toast message={toast} />

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
          <div className="s42Play sgPlay">
            {currentSpill && record && stage === "levelUp" && (
              <LevelUp level={level} onContinue={() => setStage("drawing")} />
            )}

            {currentSpill && record && stage === "drawing" && (
              <SpotlightRoulette
                key={record.sequence}
                names={names}
                spotlight={record.spotlight}
                sequence={record.sequence}
                onDone={afterRoulette}
              />
            )}

            {currentSpill && record && stage === "twist" && twist && (
              <TwistReveal
                key={record.sequence}
                twist={twist}
                name={spotlightName}
                onContinue={() => setStage("card")}
              />
            )}

            {stage === "forfeit" && forfeit && (
              <div className="sgForfeit">
                <span className="sgKicker">{forfeit.name} passed</span>
                <h1>Forfeit</h1>
                <p>{forfeit.text}</p>
                <small>
                  Streak reset. {forfeit.name} has{" "}
                  {record
                    ? PASSES_PER_PLAYER -
                      (game.passesUsed[record.spotlight] ?? 0)
                    : 0}{" "}
                  pass(es) left.
                </small>
                <button
                  className="s42Primary"
                  type="button"
                  disabled={actionLoading}
                  onClick={() => {
                    setForfeit(null);
                    advance();
                  }}
                >
                  Forfeit done · Next SPILL <span>→</span>
                </button>
              </div>
            )}

            {(stage === "card" || !record) && (
              <>
                <div className="s42PlayMeta sgMeta">
                  <span className="sgLevelBadge">
                    Lv {level.number} · {level.name}
                  </span>
                  <b>
                    {index || "…"} / {TOTAL_SPILLS}
                  </b>
                </div>
                <div className="sgSubMeta">
                  <span>
                    {resolvedConnection
                      ? connectionLabels[resolvedConnection]
                      : stored.mode === "GROUP"
                        ? `${participants.length} players`
                        : `${p1.name} & ${p2?.name ?? ""}`}
                  </span>
                  <HeatMeter heat={heat} streak={game.streak} />
                </div>

                {currentSpill && content && record ? (
                  <article
                    key={currentSpill.sequence}
                    className={`s42Prompt sgCard sgType${currentSpill.spill.type}${twist ? " hasTwist" : ""}`}
                    aria-live="polite"
                  >
                    <div className="sgSpotlight">
                      <span>Spotlight</span>
                      <b>{spotlightName}</b>
                    </div>
                    {twist && (
                      <div className="sgTwistTag">
                        ⚡ {twist.title}
                        <small>{fillName(twist.rule, spotlightName)}</small>
                      </div>
                    )}
                    <span>
                      <b>
                        <TypeIcon type={currentSpill.spill.type} />
                      </b>
                      {typeLabels[currentSpill.spill.type]}
                    </span>
                    <h1>
                      <BrandedText
                        text={currentSpill.spill.category ?? "SPILL"}
                      />
                    </h1>
                    <p>{content.text}</p>
                    {content.follow && (
                      <>
                        <i>—</i>
                        <strong>{content.follow}</strong>
                      </>
                    )}
                    {timerSeconds && <SpillTimer seconds={timerSeconds} />}
                  </article>
                ) : (
                  <article className="s42Prompt sgCard sgCardBack">
                    <div className="sgCardBackMark">42</div>
                    <p>Shuffling the deck…</p>
                  </article>
                )}

                <div className="s42CardTools sgTools">
                  <button
                    className={isSaved ? "saved" : ""}
                    type="button"
                    disabled={!currentSpill}
                    onClick={toggleSaved}
                  >
                    {isSaved ? "Saved moment" : "Remember this"}
                  </button>
                  <button
                    type="button"
                    className="sgPass"
                    disabled={!record || passesLeft <= 0 || actionLoading}
                    onClick={pass}
                  >
                    Pass · {Math.max(0, passesLeft)} left
                  </button>
                  <button
                    type="button"
                    disabled={actionLoading}
                    onClick={startEnding}
                  >
                    End
                  </button>
                </div>
                <div className="s42Progress sgProgress">
                  <span style={{ width: `${(index / TOTAL_SPILLS) * 100}%` }} />
                  <i style={{ left: `${(14 / TOTAL_SPILLS) * 100}%` }} />
                  <i style={{ left: `${(28 / TOTAL_SPILLS) * 100}%` }} />
                </div>
                <button
                  className="s42Next"
                  type="button"
                  disabled={actionLoading || !currentSpill}
                  onClick={answerAndNext}
                >
                  {actionLoading
                    ? "…"
                    : currentSpill?.sequence === TOTAL_SPILLS
                      ? "Finish SPILL 42"
                      : `${spotlightName} SPILLed · Next`}{" "}
                  <span>→</span>
                </button>
              </>
            )}
          </div>
        </section>
      )}

      {phase === "poolExhausted" && (
        <section className="s42Result">
          <div className="s42ResultMark">42</div>
          <span>You&apos;ve SPILLed all 42!</span>
          <h1>Every card. Every twist. Done.</h1>
          <p>
            {summary.answered} answered · {summary.passed} passed ·{" "}
            {summary.twists} twists survived
          </p>
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

      {phase === "endingHandoff" && currentEndingParticipant && (
        <section className="s42Ending">
          <div className="s42Handoff">
            <span>Choice saved privately</span>
            <h1>Pass the phone</h1>
            <p>
              {currentEndingParticipant.name}, tap below when the screen is
              yours.
            </p>
            <button
              className="s42Primary"
              type="button"
              disabled={!handoffReady}
              onClick={() => setPhase("ending")}
            >
              {handoffReady ? (
                <>
                  I&apos;m {currentEndingParticipant.name} <span>→</span>
                </>
              ) : (
                "One moment…"
              )}
            </button>
          </div>
        </section>
      )}

      {phase === "result" && (
        <section className="s42Result sgWrapped">
          <div className="s42ResultMark">42</div>
          <span>Your SPILL, wrapped</span>
          <h1>
            {isMutual ? (
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
            {isMutual
              ? "The feeling is mutual. Exchange details directly — and keep the connection human."
              : "No rejection screen. No match score. Just a real conversation that happened."}
          </p>

          <div className="sgStats">
            <div>
              <strong>{summary.played}</strong>
              <span>SPILLs played</span>
            </div>
            <div>
              <strong>{summary.minutes}</strong>
              <span>Minutes together</span>
            </div>
            <div>
              <strong>{summary.bestStreak}</strong>
              <span>Best streak</span>
            </div>
            <div>
              <strong>{summary.twists}</strong>
              <span>Twists survived</span>
            </div>
            <div>
              <strong>{summary.passed}</strong>
              <span>Passes used</span>
            </div>
            <div>
              <strong>{getLevel(Math.max(1, summary.played)).number}</strong>
              <span>Level reached</span>
            </div>
          </div>

          {summary.mostSpotlighted !== null && (
            <p className="sgMvp">
              Spotlight MVP · <b>{names[summary.mostSpotlighted]}</b>
            </p>
          )}

          {savedCards.length > 0 && (
            <div className="sgSaved">
              <h2>Moments you saved</h2>
              <ul>
                {savedCards.map((card) => (
                  <li key={card.sequence}>
                    <small>
                      #{card.sequence} · {card.title} · {names[card.spotlight]}
                    </small>
                    {card.text}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <blockquote>{phrase}</blockquote>
          <div className="s42ResultActions">
            <Link href="/">Return to SPILL</Link>
          </div>
        </section>
      )}
    </main>
  );
}
