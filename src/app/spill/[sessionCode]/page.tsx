"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import styles from "./spill.module.css";

type ConnectionType =
  | "FRIENDS_ONLY"
  | "FRIENDS"
  | "MAYBE_MORE"
  | "ALREADY_TOGETHER";

type CurrentSpillResponse = {
  session: {
    id: string;
    status: "WAITING" | "READY" | "ACTIVE" | "ENDING" | "ENDED";
  };
  currentSpill: {
    spill: { type: string; content: string };
  } | null;
};

const CONNECTION_OPTIONS: { value: ConnectionType; label: string }[] = [
  { value: "FRIENDS_ONLY", label: "Friends Only" },
  // { value: "FRIENDS", label: "Friends" },
  { value: "MAYBE_MORE", label: "Maybe More" },
  { value: "ALREADY_TOGETHER", label: "Already Together" },
];

const SPILL_PHRASES = [
  "Good things come to those who SPILL.",
  "Keep calm and SPILL on.",
  "When in doubt, SPILL it out.",
  "Live a little. SPILL a lot.",
  "The best is yet to SPILL.",
  "May the SPILL be with you.",
  "SPILL and you shall receive.",
];

function randomPhrase() {
  return SPILL_PHRASES[Math.floor(Math.random() * SPILL_PHRASES.length)];
}

export default function SpillSessionPage() {
  const params = useParams<{ sessionCode: string }>();
  const router = useRouter();
  const sessionCode = params.sessionCode;

  const [sessionId, setSessionId] = useState<string | null>(null);
  const [participantToken, setParticipantToken] = useState<string | null>(null);
  const [data, setData] = useState<CurrentSpillResponse | null>(null);
  const [connectionSubmitted, setConnectionSubmitted] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [endingSubmitted, setEndingSubmitted] = useState(false);
  const [poolExhausted, setPoolExhausted] = useState(false);
  const [phrase] = useState(randomPhrase);

  useEffect(() => {
    const saved = localStorage.getItem(`spill:${sessionCode}`);
    if (!saved) {
      router.replace(`/spill/${sessionCode}/join`);
      return;
    }
    const parsed = JSON.parse(saved);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSessionId(parsed.sessionId);
    setParticipantToken(parsed.participantToken);
  }, [sessionCode, router]);

  const fetchState = useCallback(async () => {
    if (!sessionId) return;
    const res = await fetch(`/api/sessions/${sessionId}/current-spill`);
    if (res.ok) {
      const json = await res.json();
      setData(json);
    }
  }, [sessionId]);

  useEffect(() => {
    if (!sessionId) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchState();
    const interval = setInterval(fetchState, 2000);
    return () => clearInterval(interval);
  }, [sessionId, fetchState]);

  async function submitConnectionType(connectionType: ConnectionType) {
    if (!sessionId || !participantToken) return;
    setActionLoading(true);
    await fetch(`/api/sessions/${sessionId}/connection-selection`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ participantToken, connectionType }),
    });
    setConnectionSubmitted(true);
    setActionLoading(false);
    fetchState();
  }

  async function goToNextSpill() {
    if (!sessionId || !participantToken) return;
    setActionLoading(true);
    const res = await fetch(`/api/sessions/${sessionId}/next-spill`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ participantToken }),
    });
    if (res.ok) {
      const json = await res.json();
      if (json.exhausted) setPoolExhausted(true);
    }
    setActionLoading(false);
    fetchState();
  }

  async function submitEnding(wantsStayConnected: boolean) {
    if (!sessionId || !participantToken) return;
    setActionLoading(true);
    await fetch(`/api/sessions/${sessionId}/ending`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ participantToken, wantsStayConnected }),
    });
    setEndingSubmitted(true);
    setActionLoading(false);
    fetchState();
  }

  if (!data) {
    return (
      <div className={styles.screen}>
        <div className={styles.card}>
          <span className={styles.pulse} />
        </div>
      </div>
    );
  }

  const status = data.session.status;

  if (status === "WAITING") return renderWaiting(phrase);
  if (status === "READY") {
    return renderConnectionType({
      connectionSubmitted,
      actionLoading,
      onSelect: submitConnectionType,
    });
  }
  if (status === "ACTIVE") {
    if (endingSubmitted) return renderEndingWait();
    if (poolExhausted && !data.currentSpill) {
      return renderPoolExhausted({ actionLoading, onEnd: submitEnding });
    }
    return renderSpill({
      currentSpill: data.currentSpill,
      actionLoading,
      onNext: goToNextSpill,
      onEnd: submitEnding,
    });
  }
  if (status === "ENDING" && !endingSubmitted) {
    return renderEndingChoice({ actionLoading, onEnd: submitEnding });
  }
  if (status === "ENDING") return renderEndingWait();

  return renderEnding(poolExhausted);
}

function renderWaiting(phrase: string) {
  return (
    <div className={styles.screen}>
      <div className={styles.card}>
        <span className={styles.logo}>SPILL</span>
        <span className={styles.pulse} />
        <h1 className={styles.title}>Waiting for your partner...</h1>
        <p className={styles.subtitle}>{phrase}</p>
      </div>
    </div>
  );
}

function renderConnectionType({
  connectionSubmitted,
  actionLoading,
  onSelect,
}: {
  connectionSubmitted: boolean;
  actionLoading: boolean;
  onSelect: (type: ConnectionType) => void;
}) {
  if (connectionSubmitted) {
    return (
      <div className={styles.screen}>
        <div className={styles.card}>
          <span className={styles.pulse} />
          <p className={styles.subtitle}>
            Waiting for the other person to choose too...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.screen}>
      <div className={styles.card}>
        <span className={styles.eyebrow}>Before we start</span>
        <h1 className={styles.title}>How do you know each other?</h1>
        <p className={styles.subtitle}>
          Your answer is private until you both submit.
        </p>
        <div className={styles.optionGrid}>
          {CONNECTION_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              className={styles.optionButton}
              disabled={actionLoading}
              onClick={() => onSelect(opt.value)}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function renderSpill({
  currentSpill,
  actionLoading,
  onNext,
  onEnd,
}: {
  currentSpill: CurrentSpillResponse["currentSpill"];
  actionLoading: boolean;
  onNext: () => void;
  onEnd: (wantsStayConnected: boolean) => void;
}) {
  if (!currentSpill) {
    return (
      <div className={styles.screen}>
        <div className={styles.card}>
          <span className={styles.logo}>SPILL</span>
          <p className={styles.subtitle}>Getting your first SPILL ready...</p>
          <button
            className={styles.button}
            disabled={actionLoading}
            onClick={onNext}
          >
            {actionLoading ? "..." : "Start"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.screen}>
      <div className={styles.card}>
        <div className={styles.spillCard}>
          <span className={styles.spillType}>{currentSpill.spill.type}</span>
          <p className={styles.spillContent}>{currentSpill.spill.content}</p>
        </div>
        <button
          className={styles.buttonSecondary}
          disabled={actionLoading}
          onClick={onNext}
        >
          {actionLoading ? "..." : "Next SPILL"}
        </button>
        <div className={styles.endRow}>
          <button
            className={styles.linkButton}
            disabled={actionLoading}
            onClick={() => onEnd(true)}
          >
            End &amp; Stay Connected
          </button>
          <button
            className={styles.linkButton}
            disabled={actionLoading}
            onClick={() => onEnd(false)}
          >
            End
          </button>
        </div>
      </div>
    </div>
  );
}

function renderPoolExhausted({
  actionLoading,
  onEnd,
}: {
  actionLoading: boolean;
  onEnd: (wantsStayConnected: boolean) => void;
}) {
  return (
    <div className={styles.screen}>
      <div className={styles.card}>
        <span className={styles.logo}>SPILL</span>
        <h1 className={styles.title}>You&apos;ve SPILLed all 42!</h1>
        <p className={styles.subtitle}>
          That&apos;s every SPILL we have for now.
        </p>
        <button
          className={styles.button}
          disabled={actionLoading}
          onClick={() => onEnd(true)}
        >
          Yes, stay connected
        </button>
        <button
          className={styles.buttonSecondary}
          disabled={actionLoading}
          onClick={() => onEnd(false)}
        >
          Wrap up
        </button>
      </div>
    </div>
  );
}

function renderEndingChoice({
  actionLoading,
  onEnd,
}: {
  actionLoading: boolean;
  onEnd: (wantsStayConnected: boolean) => void;
}) {
  return (
    <div className={styles.screen}>
      <div className={styles.card}>
        <span className={styles.logo}>SPILL</span>
        <h1 className={styles.title}>Wrapping up...</h1>
        <p className={styles.subtitle}>Would you like to stay connected?</p>
        <button
          className={styles.button}
          disabled={actionLoading}
          onClick={() => onEnd(true)}
        >
          Yes, stay connected
        </button>
        <button
          className={styles.buttonSecondary}
          disabled={actionLoading}
          onClick={() => onEnd(false)}
        >
          No thanks
        </button>
      </div>
    </div>
  );
}

function renderEndingWait() {
  return (
    <div className={styles.screen}>
      <div className={styles.card}>
        <span className={styles.pulse} />
        <p className={styles.subtitle}>Wrapping up...</p>
      </div>
    </div>
  );
}

function renderEnding(poolExhausted: boolean) {
  return (
    <div className={styles.screen}>
      <div className={styles.card}>
        <span className={styles.logo}>SPILL</span>
        <h1 className={styles.title}>
          {poolExhausted ? "We SPILLed all 42. Yes!" : "Thanks for SPILLing."}
        </h1>
        <p className={styles.subtitle}>
          {poolExhausted ? "Thanks for playing." : "Maybe we'll SPILL again."}
        </p>
      </div>
    </div>
  );
}
