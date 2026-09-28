"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import {
  fillName,
  getHeatLabel,
  type Level,
  type Twist,
} from "@/lib/spill-engine/game-rules";

export function buzz(pattern: number | number[]) {
  try {
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate(pattern);
    }
  } catch {
  }
}

function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
  );
}

const ROULETTE_DELAYS = [55, 55, 60, 65, 75, 85, 100, 120, 145, 175, 215, 265];

export function SpotlightRoulette({
  names,
  spotlight,
  sequence,
  onDone,
}: {
  names: string[];
  spotlight: number;
  sequence: number;
  onDone: () => void;
}) {
  const n = names.length;
  const steps = prefersReducedMotion() ? 0 : ROULETTE_DELAYS.length;
  const start = (((spotlight - steps) % n) + n) % n;
  const [index, setIndex] = useState(start);
  const [landed, setLanded] = useState(steps === 0);
  const doneRef = useRef(onDone);

  useEffect(() => {
    doneRef.current = onDone;
  }, [onDone]);

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    let elapsed = 0;
    for (let i = 0; i < steps; i++) {
      elapsed += ROULETTE_DELAYS[i];
      const next = (start + i + 1) % n;
      timers.push(
        setTimeout(() => {
          setIndex(next);
          buzz(8);
        }, elapsed),
      );
    }
    timers.push(
      setTimeout(() => {
        setLanded(true);
        buzz([30, 40, 60]);
      }, elapsed + 60),
    );
    timers.push(setTimeout(() => doneRef.current(), elapsed + 1150));
    return () => timers.forEach(clearTimeout);
  }, [start, steps, n]);

  return (
    <div className={`sgRoulette${landed ? " landed" : ""}`} aria-live="polite">
      <span className="sgKicker">SPILL {sequence} · Who&apos;s up?</span>
      <div className="sgRouletteName">{names[index]}</div>
      <span className="sgRouletteHint">
        {landed ? "You're in the spotlight" : "Shuffling…"}
      </span>
    </div>
  );
}

export function LevelUp({
  level,
  onContinue,
}: {
  level: Level;
  onContinue: () => void;
}) {
  useEffect(() => {
    buzz([60, 50, 60, 50, 140]);
  }, []);
  return (
    <div
      className="sgLevelUp"
      style={{ "--lvl": level.color } as CSSProperties}
    >
      <span className="sgKicker">Level unlocked</span>
      <div className="sgLevelNumber">{level.number}</div>
      <h1>{level.name}</h1>
      <p>{level.tagline}</p>
      <button className="s42Primary" type="button" onClick={onContinue}>
        Bring it <span>→</span>
      </button>
    </div>
  );
}

// ── Twist reveal ─────────────────────────────────────────────

export function TwistReveal({
  twist,
  name,
  onContinue,
}: {
  twist: Twist;
  name: string;
  onContinue: () => void;
}) {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    buzz([90, 60, 90]);
  }, []);

  useEffect(() => {
    if (count === null || count <= 0) return;
    const t = setTimeout(() => {
      setCount(count - 1);
      buzz(count - 1 === 0 ? [120, 40, 120] : 40);
    }, 900);
    return () => clearTimeout(t);
  }, [count]);

  const needsCountdown = Boolean(twist.countdown);
  const countdownDone = count === 0;

  return (
    <div className="sgTwist">
      <span className="sgTwistFlash">Twist</span>
      <h1>{twist.title}</h1>
      <p>{fillName(twist.rule, name)}</p>

      {twist.bonus && (
        <div className="sgTwistBonus">
          <strong>{twist.bonus}</strong>
          <div className="sgCountdown" aria-live="assertive">
            {count === null ? "Ready?" : count > 0 ? count : "Point!"}
          </div>
        </div>
      )}

      {needsCountdown && !countdownDone ? (
        <button
          className="s42Primary"
          type="button"
          disabled={count !== null}
          onClick={() => {
            setCount(3);
            buzz(40);
          }}
        >
          {count === null ? "Start 3-2-1" : "…"} <span>→</span>
        </button>
      ) : (
        <button className="s42Primary" type="button" onClick={onContinue}>
          {needsCountdown ? "Now the SPILL" : "Accept the twist"} <span>→</span>
        </button>
      )}
    </div>
  );
}

export function SpillTimer({ seconds }: { seconds: number }) {
  const [left, setLeft] = useState(seconds);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => {
      setLeft((current) => {
        const next = current - 1;
        if (next <= 3 && next > 0) buzz(30);
        if (next <= 0) {
          buzz([200, 80, 200]);
          setRunning(false);
          return 0;
        }
        return next;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [running]);

  const progress = left / seconds;
  const done = left === 0;
  const urgent = running && left <= 5;

  return (
    <button
      type="button"
      className={`sgTimer${running ? " running" : ""}${urgent ? " urgent" : ""}${done ? " done" : ""}`}
      style={{ "--p": progress } as CSSProperties}
      onClick={() => {
        if (done) {
          setLeft(seconds);
          setRunning(false);
          return;
        }
        setRunning((r) => !r);
      }}
      aria-label={
        done
          ? "Time is up. Tap to reset"
          : running
            ? "Pause timer"
            : "Start timer"
      }
    >
      <span className="sgTimerRing" aria-hidden="true" />
      <b>{done ? "Time!" : `${left}s`}</b>
      <small>{done ? "reset" : running ? "pause" : "start"}</small>
    </button>
  );
}

export function HeatMeter({ heat, streak }: { heat: number; streak: number }) {
  return (
    <div
      className={`sgHeat${heat >= 85 ? " max" : ""}`}
      style={{ "--heat": heat / 100 } as CSSProperties}
    >
      <div className="sgHeatTrack">
        <span />
      </div>
      <div className="sgHeatMeta">
        <b>{getHeatLabel(heat)}</b>
        <small>{streak > 0 ? `${streak} in a row` : "No streak yet"}</small>
      </div>
    </div>
  );
}

export function Toast({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <div className="sgToast" role="status" key={message}>
      {message}
    </div>
  );
}

// ── Card type icon ───────────────────────────────────────────
// SVG instead of text glyphs (?, ↯, ◆…): text characters sit at different
// heights in the display font, so they never centred in the circle.
// Every path is drawn around the exact centre (12,12) of a 24×24 box.

type CardType =
  | "QUESTION"
  | "INSTRUCTION"
  | "CHALLENGE"
  | "OBSERVATION"
  | "SCENARIO"
  | "VISION";

export function TypeIcon({ type }: { type: CardType }) {
  const common = {
    width: 16,
    height: 16,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2.2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };
  switch (type) {
    case "QUESTION":
      return (
        <svg {...common}>
          <path d="M8.6 8.4a3.5 3.5 0 1 1 5.2 3.05c-1.1.62-1.8 1.4-1.8 2.65v.4" />
          <circle cx="12" cy="19" r="0.6" fill="currentColor" />
        </svg>
      );
    case "INSTRUCTION":
      return (
        <svg {...common}>
          <path d="M13.5 3 6 13.5h6L10.5 21 18 10.5h-6L13.5 3Z" />
        </svg>
      );
    case "CHALLENGE":
      return (
        <svg {...common}>
          <path d="M12 4 20 12 12 20 4 12Z" fill="currentColor" />
        </svg>
      );
    case "OBSERVATION":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="7.5" />
          <circle cx="12" cy="12" r="3" fill="currentColor" />
        </svg>
      );
    case "SCENARIO":
      return (
        <svg {...common}>
          <path d="M7 17 17 7M9 7h8v8" />
        </svg>
      );
    case "VISION":
      return (
        <svg {...common}>
          <circle cx="6" cy="12" r="1.4" fill="currentColor" stroke="none" />
          <circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none" />
          <circle cx="18" cy="12" r="1.4" fill="currentColor" stroke="none" />
        </svg>
      );
  }
}
