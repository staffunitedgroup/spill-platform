"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { createPortal } from "react-dom";

type AdminParticipant = { id: string; displayName: string; status: string };
type AdminSession = {
  id: string;
  sessionCode: string;
  mode: "TWO_PERSON" | "GROUP";
  groupSize: number | null;
  status: string;
  createdAt: string;
  startedAt: string | null;
  table: { tableCode: string; displayName: string };
  participants: AdminParticipant[];
};

const PASSWORD_KEY = "spill-admin-password";

function formatTime(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

const statusColor: Record<string, string> = {
  ACTIVE: "var(--cyan)",
  ENDING: "var(--red)",
  READY: "#e8b339",
};

export default function AdminPage() {
  const [password, setPassword] = useState<string | null>(null);
  const [passwordInput, setPasswordInput] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isShaking, setIsShaking] = useState(false);
  const [isPending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  const [sessions, setSessions] = useState<AdminSession[] | null>(null);
  const [loadError, setLoadError] = useState("");
  const [endingId, setEndingId] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(PASSWORD_KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (saved) setPassword(saved);
    } catch {
      // localStorage unavailable — user will need to log in again
    }
  }, []);

  useEffect(() => {
    if (!password) inputRef.current?.focus();
  }, [password]);

  const loadSessions = useCallback(async (pwd: string) => {
    const res = await fetch("/api/admin/sessions", {
      headers: { "x-admin-password": pwd },
    });
    if (res.status === 401) {
      localStorage.removeItem(PASSWORD_KEY);
      setPassword(null);
      setAuthError("Incorrect password. Access denied.");
      return;
    }
    if (!res.ok) {
      setLoadError("Couldn't load the list. Try again shortly.");
      return;
    }
    const json = await res.json();
    setLoadError("");
    setSessions(json.sessions);
    setLastUpdated(new Date());
  }, []);

  useEffect(() => {
    if (!password) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadSessions(password);
    const interval = setInterval(() => loadSessions(password), 5000);
    return () => clearInterval(interval);
  }, [password, loadSessions]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isPending || !passwordInput.trim()) return;
    setAuthError(null);
    const candidate = passwordInput.trim();
    startTransition(async () => {
      const res = await fetch("/api/admin/sessions", {
        headers: { "x-admin-password": candidate },
      });
      if (res.ok) {
        localStorage.setItem(PASSWORD_KEY, candidate);
        setPassword(candidate);
      } else {
        setAuthError("Incorrect password. Access denied.");
        setIsShaking(true);
        setTimeout(() => setIsShaking(false), 600);
        inputRef.current?.select();
      }
    });
  }

  function handleLogout() {
    localStorage.removeItem(PASSWORD_KEY);
    setPassword(null);
    setSessions(null);
    setPasswordInput("");
  }

  async function endSession(sessionId: string) {
    if (!password) return;
    if (!confirm("End this session right now?")) return;
    setEndingId(sessionId);
    const res = await fetch(`/api/admin/sessions/${sessionId}/end`, {
      method: "POST",
      headers: { "x-admin-password": password },
    });
    setEndingId(null);
    if (res.ok) loadSessions(password);
  }

  if (!password) {
    if (!mounted) return null;
    return createPortal(
      <div className="lockscreen">
        <div
          className="lockscreenVideo"
          style={{
            background:
              "radial-gradient(circle at 75% 45%, rgba(255,24,56,.22), transparent 27%), linear-gradient(135deg,#090909 20%,#17100f 65%,#090909)",
          }}
        />
        <div className="lockscreenOverlay" aria-hidden="true" />

        <div
          className={`lockscreenCard ${isShaking ? "lockscreenCard--shake" : ""}`}
        >
          <div className="lockscreenText">
            <div className="lockscreenLogoWrap">
              <Image
                src="/assets/spill/brand/logo-icon.png"
                alt="SPILL"
                width={360}
                height={360}
                priority
                className="lockscreenLogo"
              />
            </div>
            <h1 className="lockscreenTitle">ADMIN ACCESS</h1>
            <p className="lockscreenSubtitle">
              Staff only. Enter the admin password to view active tables.
            </p>
          </div>

          <form className="lockscreenForm" onSubmit={handleSubmit}>
            <div className="lockscreenField">
              <input
                ref={inputRef}
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Enter admin password"
                value={passwordInput}
                onChange={(e) => {
                  setPasswordInput(e.target.value);
                  if (authError) setAuthError(null);
                }}
                disabled={isPending}
                autoComplete="current-password"
                aria-label="Admin password"
                required
                className="lockscreenInput"
              />
              <button
                type="button"
                className="lockscreenToggle"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                tabIndex={-1}
              >
                {showPassword ? (
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.75"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.75"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>

            {authError && (
              <div className="lockscreenError" role="alert">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <span>{authError}</span>
              </div>
            )}

            <button
              type="submit"
              className="lockscreenButton"
              disabled={isPending || !passwordInput.trim()}
            >
              {isPending ? (
                <span className="lockscreenSpinner" />
              ) : (
                <>
                  <span>ENTER</span>
                  <span className="lockscreenArrow">→</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>,
      document.body,
    );
  }

  return (
    <main className="interiorPage">
      <div
        className="pageIntro"
        style={{
          minHeight: "auto",
          padding: "0 0 40px",
          alignItems: "flex-start",
        }}
      >
        <div
          style={{
            width: "100%",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            flexWrap: "wrap",
            gap: 16,
          }}
        >
          <div>
            <span className="eyebrow">SPILL Admin</span>
            <h1
              style={{ fontSize: "clamp(38px,6vw,64px)", margin: "18px 0 8px" }}
            >
              Active Tables
            </h1>
            <p style={{ color: "var(--grey)", fontSize: 15 }}>
              Auto-refreshes every 5 seconds
              {lastUpdated
                ? ` · last updated ${formatTime(lastUpdated.toISOString())}`
                : ""}
              .
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="adminLogoutBtn"
            style={{
              background: "transparent",
              border: "1px solid #444",
              color: "var(--grey)",
              padding: "10px 18px",
              fontSize: 13,
              letterSpacing: ".08em",
              textTransform: "uppercase",
              cursor: "pointer",
            }}
          >
            Log Out
          </button>
        </div>
      </div>

      {loadError && (
        <p style={{ color: "var(--red)", marginBottom: 20 }}>{loadError}</p>
      )}

      {sessions === null ? (
        <p style={{ color: "var(--grey)" }}>Loading…</p>
      ) : sessions.length === 0 ? (
        <div
          style={{
            padding: 48,
            textAlign: "center",
            color: "var(--grey)",
            border: "1px dashed #333",
          }}
        >
          No active tables right now.
        </div>
      ) : (
        <div style={{ border: "1px solid #2c2c2f" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1.3fr 1fr 1fr 2.2fr 0.8fr auto",
              gap: 18,
              padding: "14px 20px",
              borderBottom: "1px solid #2c2c2f",
              background: "#0a0a0b",
              fontSize: 12,
              letterSpacing: ".1em",
              textTransform: "uppercase",
              color: "var(--grey)",
            }}
          >
            <span>Table</span>
            <span>Mode</span>
            <span>Status</span>
            <span>Participants</span>
            <span>Started</span>
            <span></span>
          </div>
          {sessions.map((s) => (
            <div
              key={s.id}
              className="adminRow"
              style={{
                display: "grid",
                gridTemplateColumns: "1.3fr 1fr 1fr 2.2fr 0.8fr auto",
                gap: 18,
                alignItems: "center",
                padding: "20px 20px",
                borderBottom: "1px solid #2c2c2f",
                flexWrap: "wrap",
              }}
            >
              <div>
                <div
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: 18,
                    textTransform: "uppercase",
                  }}
                >
                  {s.table.displayName || s.table.tableCode}
                </div>
                <div
                  style={{
                    fontSize: 13,
                    color: "var(--grey)",
                    letterSpacing: ".05em",
                  }}
                >
                  {s.sessionCode}
                </div>
              </div>
              <div
                style={{
                  fontSize: 14,
                  textTransform: "uppercase",
                  letterSpacing: ".05em",
                }}
              >
                {s.mode === "GROUP" ? `Group (${s.groupSize})` : "Two People"}
              </div>
              <div>
                <span
                  style={{
                    padding: "4px 12px",
                    border: `1px solid ${statusColor[s.status] ?? "#555"}`,
                    color: statusColor[s.status] ?? "var(--grey)",
                    fontSize: 12,
                    letterSpacing: ".1em",
                    textTransform: "uppercase",
                  }}
                >
                  {s.status}
                </span>
              </div>
              <div style={{ fontSize: 14, color: "#c8c8c8" }}>
                {s.participants.length}
                {s.mode === "GROUP" ? `/${s.groupSize}` : "/2"} —{" "}
                {s.participants.map((p) => p.displayName).join(", ") ||
                  "no one yet"}
              </div>
              <div style={{ fontSize: 13, color: "var(--grey)" }}>
                {formatTime(s.startedAt ?? s.createdAt)}
              </div>
              <div>
                <button
                  disabled={endingId === s.id}
                  onClick={() => endSession(s.id)}
                  className="adminEndBtn"
                  style={{
                    background: "transparent",
                    border: "1px solid var(--red)",
                    color: "var(--red)",
                    fontSize: 13,
                    padding: "8px 14px",
                    letterSpacing: ".08em",
                    textTransform: "uppercase",
                    cursor: endingId === s.id ? "default" : "pointer",
                    opacity: endingId === s.id ? 0.5 : 1,
                    whiteSpace: "nowrap",
                  }}
                >
                  {endingId === s.id ? "…" : "End"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
