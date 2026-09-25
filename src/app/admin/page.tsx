"use client";

import { useCallback, useEffect, useState } from "react";

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

export default function AdminPage() {
  const [passwordInput, setPasswordInput] = useState("");
  const [authError, setAuthError] = useState("");
  const [sessions, setSessions] = useState<AdminSession[] | null>(null);
  const [loadError, setLoadError] = useState("");
  const [endingId, setEndingId] = useState<string | null>(null);

  const [password, setPassword] = useState<string | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(PASSWORD_KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (saved) setPassword(saved);
    } catch {
      // localStorage unavailable — ignore, user will need to log in again
    }
  }, []);

  const loadSessions = useCallback(async (pwd: string) => {
    const res = await fetch("/api/admin/sessions", {
      headers: { "x-admin-password": pwd },
    });
    if (res.status === 401) {
      localStorage.removeItem(PASSWORD_KEY);
      setPassword(null);
      setAuthError("Sai mật khẩu.");
      return;
    }
    if (!res.ok) {
      setLoadError("Không tải được danh sách. Thử lại sau.");
      return;
    }
    const json = await res.json();
    setLoadError("");
    setSessions(json.sessions);
  }, []);

  useEffect(() => {
    if (!password) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadSessions(password);
    const interval = setInterval(() => loadSessions(password), 5000);
    return () => clearInterval(interval);
  }, [password, loadSessions]);

  function handleLogin() {
    if (!passwordInput.trim()) return;
    localStorage.setItem(PASSWORD_KEY, passwordInput.trim());
    setPassword(passwordInput.trim());
    setAuthError("");
  }

  async function endSession(sessionId: string) {
    if (!password) return;
    if (!confirm("Kết thúc session này ngay bây giờ?")) return;
    setEndingId(sessionId);
    const res = await fetch(`/api/admin/sessions/${sessionId}/end`, {
      method: "POST",
      headers: { "x-admin-password": password },
    });
    setEndingId(null);
    if (res.ok) loadSessions(password);
  }

  if (!password) {
    return (
      <main style={{ padding: 32, maxWidth: 360, margin: "0 auto" }}>
        <h1 style={{ fontSize: 20, marginBottom: 16 }}>SPILL Admin</h1>
        <input
          type="password"
          value={passwordInput}
          onChange={(e) => setPasswordInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleLogin()}
          placeholder="Nhập mật khẩu"
          style={{ width: "100%", padding: 10, marginBottom: 8 }}
        />
        <button onClick={handleLogin} style={{ width: "100%", padding: 10 }}>
          Đăng nhập
        </button>
        {authError && <p style={{ color: "red", marginTop: 8 }}>{authError}</p>}
      </main>
    );
  }

  return (
    <main style={{ padding: 24, maxWidth: 900, margin: "0 auto" }}>
      <h1 style={{ fontSize: 20, marginBottom: 16 }}>
        SPILL Admin — Bàn đang hoạt động
      </h1>
      {loadError && <p style={{ color: "red" }}>{loadError}</p>}
      {sessions === null ? (
        <p>Đang tải…</p>
      ) : sessions.length === 0 ? (
        <p>Không có session nào đang hoạt động.</p>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ textAlign: "left", borderBottom: "1px solid #ccc" }}>
              <th style={{ padding: 8 }}>Bàn</th>
              <th style={{ padding: 8 }}>Chế độ</th>
              <th style={{ padding: 8 }}>Trạng thái</th>
              <th style={{ padding: 8 }}>Người tham gia</th>
              <th style={{ padding: 8 }}>Bắt đầu</th>
              <th style={{ padding: 8 }}></th>
            </tr>
          </thead>
          <tbody>
            {sessions.map((s) => (
              <tr key={s.id} style={{ borderBottom: "1px solid #eee" }}>
                <td style={{ padding: 8 }}>
                  {s.table.displayName || s.table.tableCode}
                </td>
                <td style={{ padding: 8 }}>
                  {s.mode === "GROUP" ? `Group (${s.groupSize})` : "Two People"}
                </td>
                <td style={{ padding: 8 }}>{s.status}</td>
                <td style={{ padding: 8 }}>
                  {s.participants.length}
                  {s.mode === "GROUP" ? `/${s.groupSize}` : "/2"} —{" "}
                  {s.participants.map((p) => p.displayName).join(", ") || "—"}
                </td>
                <td style={{ padding: 8 }}>
                  {formatTime(s.startedAt ?? s.createdAt)}
                </td>
                <td style={{ padding: 8 }}>
                  <button
                    disabled={endingId === s.id}
                    onClick={() => endSession(s.id)}
                  >
                    {endingId === s.id ? "…" : "Kết thúc"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  );
}
