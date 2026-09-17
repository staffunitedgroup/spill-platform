// src/app/spill/[sessionCode]/join/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import styles from "../spill.module.css";

/**
 * /spill/[sessionCode]/join
 *
 * LƯU Ý CHO NGƯỜI CHỈNH UI: phần logic (fetch/state) không nên đổi.
 * Muốn chỉnh giao diện thêm, sửa trong file spill.module.css cùng thư mục,
 * hoặc thay className bên dưới bằng component khác — miễn giữ nguyên các
 * hàm xử lý (handleSubmit, useEffect...) không đổi.
 */
export default function JoinPage() {
  const params = useParams<{ sessionCode: string }>();
  const router = useRouter();
  const sessionCode = params.sessionCode;

  const [displayName, setDisplayName] = useState("");
  const [status, setStatus] = useState<
    "idle" | "checking" | "submitting" | "error"
  >("checking");
  const [errorMessage, setErrorMessage] = useState("");
  const [sessionId, setSessionId] = useState<string | null>(null);

  useEffect(() => {
    async function lookupSession() {
      try {
        const res = await fetch(`/api/sessions/by-code/${sessionCode}`);
        const data = await res.json();

        if (!res.ok) {
          setErrorMessage(data.error?.message ?? "Session not found.");
          setStatus("error");
          return;
        }

        if (
          data.session.status !== "WAITING" &&
          data.session.status !== "READY"
        ) {
          setErrorMessage("This SPILL session is no longer available.");
          setStatus("error");
          return;
        }

        setSessionId(data.session.id);
        setStatus("idle");
      } catch {
        setErrorMessage("Could not reach the server. Please try again.");
        setStatus("error");
      }
    }

    lookupSession();
  }, [sessionCode]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!sessionId || !displayName.trim()) return;

    setStatus("submitting");
    setErrorMessage("");

    try {
      const res = await fetch(`/api/sessions/${sessionId}/participants`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ displayName: displayName.trim() }),
      });
      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error?.message ?? "Could not join this session.");
        setStatus("error");
        return;
      }

      localStorage.setItem(
        `spill:${sessionCode}`,
        JSON.stringify({
          sessionId,
          participantToken: data.participant.participantToken,
        }),
      );

      router.push(`/spill/${sessionCode}`);
    } catch {
      setErrorMessage("Could not reach the server. Please try again.");
      setStatus("error");
    }
  }

  if (status === "checking") {
    return (
      <div className={styles.screen}>
        <div className={styles.card}>
          <span className={styles.pulse} />
          <p className={styles.subtitle}>Loading...</p>
        </div>
      </div>
    );
  }

  if (status === "error" && !sessionId) {
    return (
      <div className={styles.screen}>
        <div className={styles.card}>
          <span className={styles.logo}>SPILL</span>
          <p className={styles.errorText}>{errorMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.screen}>
      <div className={styles.card}>
        <span className={styles.logo}>SPILL</span>
        <h1 className={styles.title}>What&apos;s your name?</h1>
        <form className={styles.form} onSubmit={handleSubmit}>
          <input
            className={styles.input}
            type="text"
            placeholder="Your name"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            maxLength={40}
            required
            autoFocus
          />
          <button
            className={styles.button}
            type="submit"
            disabled={status === "submitting"}
          >
            {status === "submitting" ? "Joining..." : "Join"}
          </button>
        </form>
        {errorMessage && status === "error" && (
          <p className={styles.errorText}>{errorMessage}</p>
        )}
      </div>
    </div>
  );
}
