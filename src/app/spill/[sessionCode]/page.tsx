"use client";

// ─────────────────────────────────────────────────────────────
// SPILL 42 — multi-phone game screen.
//
// Every player is on THEIR OWN phone (joined via the table QR). This page:
//   • polls the shared session state from the server,
//   • shows private choices (connection level, ending) only on your phone,
//   • derives spotlight / twists / streak from the server so every phone
//     at the table sees exactly the same game.
// ─────────────────────────────────────────────────────────────

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { StayConnectedCard } from "@/components/stay-connected-card";
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
  GAME_EXTRAS,
  STREAK_MILESTONES,
  TOTAL_SPILLS,
  deriveStats,
  fillName,
  getForfeit,
  getHeat,
  getLevel,
  getTimerSeconds,
  isLevelStart,
  spotlightFor,
  twistAt,
  type SpillType,
} from "@/lib/spill-engine/game-rules";
import { clearMe, loadMe, type DevicePlayer } from "@/lib/spill-device";
import "../spill-game.css";

type ConnectionType = "FRIENDS_ONLY" | "MAYBE_MORE" | "ALREADY_TOGETHER";
type SessionStatus = "WAITING" | "READY" | "ACTIVE" | "ENDING" | "ENDED";
type SessionMode = "TWO_PERSON" | "GROUP";

type SharedState = {
  session: {
    id: string;
    sessionCode: string;
    mode: SessionMode;
    status: SessionStatus;
    startedAt: string | null;
    endedAt: string | null;
    maxParticipants: number;
    tableCode: string;
  };
  participants: { id: string; displayName: string }[];
  me: number;
  connection: {
    mine: boolean;
    myChoice: ConnectionType | null;
    submitted: number;
  };
  ending: { mine: boolean; submitted: number; mutual: boolean | null };
  history: { sequence: number; passed: boolean; completed: boolean }[];
  currentSpill: {
    sequence: number;
    spill: { type: SpillType; content: string; category: string | null };
  } | null;
};

// level-up → spotlight roulette → twist → card.
type Stage = "forfeit" | "levelUp" | "drawing" | "twist" | "card";

type SavedMoment = {
  sequence: number;
  title: string;
  text: string;
  who: string;
};

const POLL_MS = 1500;
const FIRST_CARD_FALLBACK_MS = 3000;

const CONNECTION_OPTIONS: {
  value: ConnectionType;
  label: string;
  note: string;
}[] = [
  { value: "FRIENDS_ONLY", label: "Friends", note: "Keep it easy." },
  {
    value: "MAYBE_MORE",
    label: "Friend Plus",
    note: "Leave room for possibility.",
  },
];

const connectionLabels: Record<ConnectionType, string> = {
  FRIENDS_ONLY: "Friends only",
  MAYBE_MORE: "Friends Plus",
  // No longer offered; kept so older sessions still show a label.
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

function splitContent(content: string) {
  const [text, follow] = content.split("|||");
  return { text: text ?? content, follow: follow ?? "" };
}

function savedKey(code: string) {
  return `spill:${code}:saved`;
}

function loadSaved(code: string): SavedMoment[] {
  try {
    const raw = localStorage.getItem(savedKey(code));
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function persistSaved(code: string, saved: SavedMoment[]) {
  try {
    localStorage.setItem(savedKey(code), JSON.stringify(saved));
  } catch {}
}

function names(list: string[]) {
  if (list.length <= 1) return list.join("");
  return `${list.slice(0, -1).join(", ")} & ${list[list.length - 1]}`;
}

export default function SpillSessionPage() {
  const params = useParams<{ sessionCode: string }>();
  const router = useRouter();
  const sessionCode = params.sessionCode;

  const [me, setMe] = useState<DevicePlayer | null>(null);
  const [data, setData] = useState<SharedState | null>(null);
  const [stage, setStage] = useState<Stage>("card");
  const [shownSeq, setShownSeq] = useState(0);
  const [endingOpen, setEndingOpen] = useState(false);
  const [exhausted, setExhausted] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [saved, setSaved] = useState<SavedMoment[]>([]);
  const [toast, setToast] = useState<string | null>(null);
  const initialisedRef = useRef(false);
  const lastStreakRef = useRef(0);
  const noCardSinceRef = useRef(0);
  const lastDrawAttemptRef = useRef(0);
  const [phrase] = useState(
    () => SPILL_PHRASES[Math.floor(Math.random() * SPILL_PHRASES.length)],
  );

  useEffect(() => {
    const player = loadMe(sessionCode);
    if (!player) {
      router.replace(`/spill/${sessionCode}/join`);
      return;
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMe(player);
    setSaved(loadSaved(sessionCode));
  }, [sessionCode, router]);

  const fetchState = useCallback(async () => {
    if (!me) return;
    try {
      const res = await fetch(
        `/api/sessions/${me.sessionId}/current-spill?participantToken=${encodeURIComponent(me.token)}`,
        { cache: "no-store" },
      );
      if (res.status === 403 || res.status === 404) {
        clearMe(sessionCode);
        router.replace(`/spill/${sessionCode}/join`);
        return;
      }
      if (res.ok) setData(await res.json());
    } catch {}
  }, [me, router, sessionCode]);

  useEffect(() => {
    if (!me) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchState();
    const id = setInterval(fetchState, POLL_MS);
    return () => clearInterval(id);
  }, [me, fetchState]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2600);
    return () => clearTimeout(t);
  }, [toast]);

  const session = data?.session;
  const players = data?.participants ?? [];
  const n = Math.max(players.length, 1);
  const current = data?.currentSpill ?? null;
  const seq = current?.sequence ?? 0;

  useEffect(() => {
    if (!data || !session || !current) return;
    if (current.sequence === shownSeq) return;

    // First load (or reload mid-card): just show it, no animation.
    if (!initialisedRef.current) {
      initialisedRef.current = true;

      setShownSeq(current.sequence);
      setStage("card");
      return;
    }

    const prev = data.history.find((h) => h.sequence === current.sequence - 1);
    const first: Stage =
      GAME_EXTRAS && prev?.passed
        ? "forfeit"
        : isLevelStart(current.sequence)
          ? "levelUp"
          : "drawing";
    setShownSeq(current.sequence);
    setStage(first);
  }, [data, session, current, shownSeq]);

  useEffect(() => {
    if (data && !current) initialisedRef.current = true;
  }, [data, current]);

  const advance = useCallback(
    async (passed = false) => {
      if (!me || actionLoading) return;
      setActionLoading(true);
      try {
        const res = await fetch(`/api/sessions/${me.sessionId}/next-spill`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            participantToken: me.token,
            currentSequence: seq,
            ...(passed ? { passed: true } : {}),
          }),
        });
        const json = await res.json().catch(() => ({}));
        if (res.ok && json.exhausted) {
          setExhausted(true);
          buzz([80, 60, 80, 60, 240]);
        } else if (!res.ok) {
          const code = json.error?.code;
          if (code !== "ALREADY_ADVANCED") {
            setToast(
              json.error?.message ?? "Couldn't reach SPILL. Trying again…",
            );
          }
        }
      } catch {
        setToast("Connection issue — trying again…");
      } finally {
        setActionLoading(false);
        fetchState();
      }
    },
    [me, actionLoading, seq, fetchState],
  );

  useEffect(() => {
    const waitingForFirstCard =
      !!data &&
      !!session &&
      session.status === "ACTIVE" &&
      !current &&
      data.history.length === 0;
    if (!waitingForFirstCard) {
      noCardSinceRef.current = 0;
      return;
    }
    const now = Date.now();
    if (!noCardSinceRef.current) noCardSinceRef.current = now;
    const myTurnToDraw =
      data.me === 0 || now - noCardSinceRef.current > FIRST_CARD_FALLBACK_MS;
    if (
      myTurnToDraw &&
      now - lastDrawAttemptRef.current > FIRST_CARD_FALLBACK_MS
    ) {
      lastDrawAttemptRef.current = now;
      advance(false);
    }
  }, [data, session, current, advance]);

  const stats =
    data && session
      ? deriveStats(session.id, session.mode, n, data.history)
      : null;

  const streak = stats?.streak ?? 0;
  useEffect(() => {
    if (
      GAME_EXTRAS &&
      streak > lastStreakRef.current &&
      STREAK_MILESTONES.includes(streak)
    ) {
      setToast(`${streak} in a row — the heat is rising`);
      buzz([40, 30, 40]);
    }
    lastStreakRef.current = streak;
  }, [streak]);

  if (!me || !data || !session || !stats) {
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

  const myIndex = data.me;
  const myName = players[myIndex]?.displayName ?? me.name;
  const nameOf = (i: number) => players[i]?.displayName ?? `Player ${i + 1}`;

  const spotlight = seq ? spotlightFor(session.id, seq, n) : 0;
  const spotlightName = nameOf(spotlight);
  const isMyTurn = spotlight === myIndex;
  const twist = seq ? twistAt(session.id, seq, session.mode) : null;
  const level = getLevel(Math.max(1, seq || stats.played));
  const heat = GAME_EXTRAS ? getHeat(stats.streak, Math.max(1, seq)) : 0;
  const myPassesLeft = PASSES_PER_PLAYER - (stats.passesUsed[myIndex] ?? 0);
  const content = current ? splitContent(current.spill.content) : null;
  const timerSeconds = current
    ? getTimerSeconds(current.spill.type, twist)
    : null;
  const isSaved = saved.some((s) => s.sequence === seq);

  const prevCard = data.history.find((h) => h.sequence === seq - 1);
  const forfeitWho =
    seq > 1 ? nameOf(spotlightFor(session.id, seq - 1, n)) : "";
  const forfeitText = seq > 1 ? getForfeit(session.id, seq - 1) : "";

  const allDone =
    data.history.length > 0 && data.history.every((h) => h.completed);
  const poolExhausted =
    session.status === "ACTIVE" && !current && (exhausted || allDone);

  const minutes =
    session.startedAt && session.endedAt
      ? Math.max(
          1,
          Math.round(
            (new Date(session.endedAt).getTime() -
              new Date(session.startedAt).getTime()) /
              60000,
          ),
        )
      : 1;

  function afterRoulette() {
    setStage(twist ? "twist" : "card");
  }

  function afterForfeit() {
    setStage(isLevelStart(seq) ? "levelUp" : "drawing");
  }

  function toggleSaved() {
    if (!current || !content) return;
    const next = isSaved
      ? saved.filter((s) => s.sequence !== seq)
      : [
          ...saved,
          {
            sequence: seq,
            title: current.spill.category ?? "SPILL",
            text: content.text,
            who: spotlightName,
          },
        ];
    setSaved(next);
    persistSaved(sessionCode, next);
  }

  async function submitConnection(value: ConnectionType) {
    if (!me) return;
    setActionLoading(true);
    await fetch(`/api/sessions/${me.sessionId}/connection-selection`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        participantToken: me.token,
        connectionType: value,
      }),
    }).catch(() => null);
    setActionLoading(false);
    fetchState();
  }

  async function submitEnding(wantsStayConnected: boolean) {
    if (!me) return;
    setActionLoading(true);
    const res = await fetch(`/api/sessions/${me.sessionId}/ending`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ participantToken: me.token, wantsStayConnected }),
    }).catch(() => null);
    setActionLoading(false);
    if (res?.ok) buzz([60, 40, 60]);
    fetchState();
  }

  type Screen =
    | "lobby"
    | "connection"
    | "connectionWait"
    | "game"
    | "poolExhausted"
    | "ending"
    | "endingWait"
    | "result";

  let screen: Screen = "lobby";
  if (session.status === "WAITING") screen = "lobby";
  else if (session.status === "READY")
    screen = data.connection.mine ? "connectionWait" : "connection";
  else if (session.status === "ACTIVE")
    screen = endingOpen ? "ending" : poolExhausted ? "poolExhausted" : "game";
  else if (session.status === "ENDING")
    screen = data.ending.mine ? "endingWait" : "ending";
  else screen = "result";

  const others = players
    .filter((_, i) => i !== myIndex)
    .map((p) => p.displayName);

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
        <span className="sgMe">{myName}</span>
      </header>

      <Toast message={toast} />

      {screen === "lobby" && (
        <section className="s42Setup">
          <div className="s42SetupPanel sgLobby">
            <div className="s42SetupHeading">
              <span>
                {players.length} of {session.maxParticipants} joined
              </span>
              <h1>Waiting for your table</h1>
              <p>
                Everyone scans the QR on the table with their own phone. The
                game starts when all {session.maxParticipants} are in.
              </p>
            </div>
            <ul className="sgSeats">
              {Array.from({ length: session.maxParticipants }, (_, i) => (
                <li key={i} className={players[i] ? "taken" : ""}>
                  <b>{players[i] ? players[i].displayName : "Waiting…"}</b>
                  {i === myIndex && <small>You</small>}
                </li>
              ))}
            </ul>
            <p className="s42Permission">
              Table code <b className="sgCode">{session.sessionCode}</b>
            </p>
          </div>
        </section>
      )}

      {screen === "connection" && (
        <section className="s42Setup">
          <div className="s42SetupPanel private">
            <div className="s42PrivateBadge">Private · only you see this</div>
            <div className="s42SetupHeading">
              <span>Choose connection</span>
              <h1>What feels right?</h1>
              <p>
                {names(others)} won&apos;t see your answer. SPILL uses only the
                least intimate option you both chose.
              </p>
            </div>
            <div className="s42ChoiceGrid three">
              {CONNECTION_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  disabled={actionLoading}
                  onClick={() => submitConnection(opt.value)}
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

      {screen === "connectionWait" && (
        <section className="s42Setup">
          <div className="s42Handoff">
            <span>Choice saved privately</span>
            <h1>Waiting for {names(others)}</h1>
            <p>Nobody will ever see what you chose.</p>
            <div className="sgPulseDots" aria-hidden="true">
              <i />
              <i />
              <i />
            </div>
          </div>
        </section>
      )}

      {screen === "game" && (
        <section className="s42Dashboard">
          <div className="s42Play sgPlay">
            {current && stage === "forfeit" && prevCard?.passed && (
              <div className="sgForfeit">
                <span className="sgKicker">{forfeitWho} passed</span>
                <h1>Forfeit</h1>
                <p>{forfeitText}</p>
                <small>Streak reset. The table decides if it counts.</small>
                <button
                  className="s42Primary"
                  type="button"
                  onClick={afterForfeit}
                >
                  Continue <span>→</span>
                </button>
              </div>
            )}

            {current && stage === "levelUp" && (
              <LevelUp level={level} onContinue={() => setStage("drawing")} />
            )}

            {current && stage === "drawing" && (
              <SpotlightRoulette
                key={seq}
                names={players.map((p) => p.displayName)}
                spotlight={spotlight}
                sequence={seq}
                onDone={afterRoulette}
              />
            )}

            {current && stage === "twist" && twist && (
              <TwistReveal
                key={seq}
                twist={twist}
                name={spotlightName}
                onContinue={() => setStage("card")}
              />
            )}

            {(stage === "card" ||
              !current ||
              (stage === "forfeit" && !prevCard?.passed)) && (
              <>
                <div className="s42PlayMeta sgMeta">
                  <span className="sgLevelBadge">
                    Lv {level.number} · {level.name}
                  </span>
                  <b>
                    {seq || "…"} / {TOTAL_SPILLS}
                  </b>
                </div>
                <div className="sgSubMeta">
                  <span>
                    {data.connection.myChoice
                      ? `You chose · ${connectionLabels[data.connection.myChoice]}`
                      : `${players.length} players`}
                  </span>
                  {GAME_EXTRAS && (
                    <HeatMeter heat={heat} streak={stats.streak} />
                  )}
                </div>

                {current && content ? (
                  <article
                    key={seq}
                    className={`s42Prompt sgCard sgType${current.spill.type}${twist ? " hasTwist" : ""}${isMyTurn ? " isMine" : ""}`}
                    aria-live="polite"
                  >
                    <div className="sgSpotlight">
                      {isMyTurn ? (
                        <b>Your turn</b>
                      ) : (
                        <>
                          <span>Spotlight</span>
                          <b>{spotlightName}</b>
                        </>
                      )}
                    </div>
                    {twist && (
                      <div className="sgTwistTag">
                        ⚡ {twist.title}
                        <small>
                          {fillName(
                            twist.rule,
                            isMyTurn ? "You" : spotlightName,
                          )}
                        </small>
                      </div>
                    )}
                    <span>
                      <b>
                        <TypeIcon type={current.spill.type} />
                      </b>
                      {typeLabels[current.spill.type]}
                    </span>
                    <h1>
                      <BrandedText text={current.spill.category ?? "SPILL"} />
                    </h1>
                    <p>{content.text}</p>
                    {content.follow && (
                      <>
                        <i>—</i>
                        <strong>{content.follow}</strong>
                      </>
                    )}
                    {timerSeconds && (
                      <SpillTimer key={`t${seq}`} seconds={timerSeconds} />
                    )}
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
                    disabled={!current}
                    onClick={toggleSaved}
                  >
                    {isSaved ? "Saved moment" : "Remember this"}
                  </button>
                  {isMyTurn && current && (
                    <button
                      type="button"
                      className="sgPass"
                      disabled={myPassesLeft <= 0 || actionLoading}
                      onClick={() => {
                        buzz(150);
                        advance(true);
                      }}
                    >
                      Pass · {Math.max(0, myPassesLeft)} left
                    </button>
                  )}
                  <button
                    type="button"
                    className="sgEnd"
                    disabled={actionLoading}
                    onClick={() => setEndingOpen(true)}
                    aria-label="End SPILL — finish the game for the whole table"
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.4"
                      strokeLinecap="round"
                      aria-hidden="true"
                    >
                      <path d="M12 3v9" />
                      <path d="M6.3 6.8a8 8 0 1 0 11.4 0" />
                    </svg>
                    End SPILL
                  </button>
                </div>
                <div className="s42Progress sgProgress">
                  <span style={{ width: `${(seq / TOTAL_SPILLS) * 100}%` }} />
                  <i style={{ left: `${(14 / TOTAL_SPILLS) * 100}%` }} />
                  <i style={{ left: `${(28 / TOTAL_SPILLS) * 100}%` }} />
                </div>
                <button
                  className="s42Next"
                  type="button"
                  disabled={
                    actionLoading || (!current && data.history.length > 0)
                  }
                  onClick={() => advance(false)}
                >
                  {actionLoading
                    ? "…"
                    : !current
                      ? "Draw the first SPILL"
                      : seq === TOTAL_SPILLS
                        ? "Finish SPILL 42"
                        : isMyTurn
                          ? "I SPILLed · Next"
                          : `${spotlightName} SPILLed · Next`}{" "}
                  <span>→</span>
                </button>
              </>
            )}
          </div>
        </section>
      )}

      {screen === "poolExhausted" && (
        <section className="s42Result">
          <div className="s42ResultMark">42</div>
          <span>You&apos;ve SPILLed all 42!</span>
          <h1>Every card. Done.</h1>
          <p>
            {stats.answered} answered · {stats.passed} passed
            {GAME_EXTRAS && ` · ${stats.twists} twists survived`}
          </p>
          <div className="s42ResultActions">
            <button
              className="s42Primary"
              type="button"
              onClick={() => setEndingOpen(true)}
            >
              Wrap up <span>→</span>
            </button>
          </div>
        </section>
      )}

      {screen === "ending" && (
        <section className="s42Ending">
          <div className="s42EndPanel">
            <div className="s42PrivateBadge">Private · only you see this</div>
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
            {session.status === "ACTIVE" && (
              <button
                className="s42Back"
                type="button"
                onClick={() => setEndingOpen(false)}
              >
                ← Keep playing
              </button>
            )}
          </div>
        </section>
      )}

      {screen === "endingWait" && (
        <section className="s42Ending">
          <div className="s42Handoff">
            <span>Choice saved privately</span>
            <h1>Waiting for the table</h1>
            <p>
              {data.ending.submitted} of {players.length} have chosen. Nobody
              sees anyone else&apos;s answer.
            </p>
            <div className="sgPulseDots" aria-hidden="true">
              <i />
              <i />
              <i />
            </div>
          </div>
        </section>
      )}

      {screen === "result" && (
        <section className="s42Result sgWrapped">
          <div className="s42ResultMark">42</div>
          <span>Your SPILL, wrapped</span>
          <h1>
            {data.ending.mutual ? (
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
            {data.ending.mutual
              ? "The feeling is mutual. No numbers to swap — SPILL can tell you when you're both here again."
              : "No rejection screen. No match score. Just a real conversation that happened."}
          </p>

          {/* Phase 3: only when BOTH chose Stay Connected (2 players). */}
          {data.ending.mutual && players.length === 2 && (
            <StayConnectedCard
              participantToken={me.token}
              partnerName={nameOf(myIndex === 0 ? 1 : 0)}
              sessionCode={sessionCode}
            />
          )}

          <div className={`sgStats${GAME_EXTRAS ? " isSix" : ""}`}>
            <div>
              <strong>{stats.played}</strong>
              <span>SPILLs played</span>
            </div>
            <div>
              <strong>{minutes}</strong>
              <span>Minutes together</span>
            </div>
            {GAME_EXTRAS && (
              <>
                <div>
                  <strong>{stats.bestStreak}</strong>
                  <span>Best streak</span>
                </div>
                <div>
                  <strong>{stats.twists}</strong>
                  <span>Twists survived</span>
                </div>
              </>
            )}
            <div>
              <strong>{stats.passed}</strong>
              <span>Passes used</span>
            </div>
            <div>
              <strong>{getLevel(Math.max(1, stats.played)).number}</strong>
              <span>Level reached</span>
            </div>
          </div>

          {saved.length > 0 && (
            <div className="sgSaved">
              <h2>Moments you saved</h2>
              <ul>
                {[...saved]
                  .sort((a, b) => a.sequence - b.sequence)
                  .map((card) => (
                    <li key={card.sequence}>
                      <small>
                        #{card.sequence} · {card.title} · {card.who}
                      </small>
                      {card.text}
                    </li>
                  ))}
              </ul>
            </div>
          )}

          <blockquote suppressHydrationWarning>{phrase}</blockquote>
          <div className="s42ResultActions">
            <Link href={`/spill/table/${me.homeTable ?? session.tableCode}`}>
              Return to SPILL
            </Link>
          </div>
        </section>
      )}
    </main>
  );
}
