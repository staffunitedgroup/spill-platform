"use client";

// Staff view for "Meet someone new" (Phase 2):
//   • Tables   — free / waiting / playing, at a glance
//   • Open now — who is open to SPILL (or paused), with "Take off list"
//   • Reports  — what guests reported, with "Resolve"
import { useCallback, useEffect, useState } from "react";
import "@/app/admin/admin-floor.css";

type FloorTable = {
  tableCode: string;
  displayName: string;
  state: "FREE" | "WAITING" | "PLAYING";
  sessionCode: string | null;
  players: string[];
};
type FloorOpen = {
  id: string;
  displayName: string;
  status: "OPEN" | "PAUSED";
  tableCode: string;
  openMinutes: number;
  minutesLeft: number;
  reports: number;
  away: boolean;
};
type FloorReport = {
  id: string;
  reason: "UNCOMFORTABLE" | "INAPPROPRIATE_NAME" | "SPAM" | "OTHER";
  note: string | null;
  status: "OPEN" | "RESOLVED";
  createdAt: string;
  reporter: { name: string; tableCode: string };
  reported: { id: string; name: string; tableCode: string; stillOpen: boolean };
};
type Floor = {
  tables: FloorTable[];
  open: FloorOpen[];
  reports: FloorReport[];
};

const REASON_LABEL: Record<FloorReport["reason"], string> = {
  UNCOMFORTABLE: "Made them uncomfortable",
  INAPPROPRIATE_NAME: "Inappropriate name",
  SPAM: "Too many invites",
  OTHER: "Other",
};

const STATE_LABEL: Record<FloorTable["state"], string> = {
  FREE: "Free",
  WAITING: "Waiting",
  PLAYING: "Playing",
};

function time(iso: string) {
  return new Date(iso).toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function AdminFloor({ password }: { password: string }) {
  const [floor, setFloor] = useState<Floor | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/open", {
        headers: { "x-admin-password": password },
        cache: "no-store",
      });
      if (!res.ok) {
        setError("Couldn't load the floor view. Try again shortly.");
        return;
      }
      setFloor(await res.json());
      setError("");
    } catch {
      setError("Connection issue — retrying…");
    }
  }, [password]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
    const id = setInterval(load, 5000);
    return () => clearInterval(id);
  }, [load]);

  async function post(path: string, key: string, confirmText?: string) {
    if (confirmText && !confirm(confirmText)) return;
    setBusy(key);
    try {
      await fetch(path, {
        method: "POST",
        headers: { "x-admin-password": password },
      });
    } finally {
      setBusy(null);
      load();
    }
  }

  const openReports = floor?.reports.filter((r) => r.status === "OPEN") ?? [];

  return (
    <section className="afFloor">
      {error && <p className="afError">{error}</p>}

      {/* Tables */}
      <div className="afBlock">
        <div className="afHead">
          <h2>Tables</h2>
          {floor && (
            <span>
              {floor.tables.filter((t) => t.state === "PLAYING").length} playing
              · {floor.tables.filter((t) => t.state === "WAITING").length}{" "}
              waiting · {floor.tables.filter((t) => t.state === "FREE").length}{" "}
              free
            </span>
          )}
        </div>
        {!floor ? (
          <p className="afMuted">Loading…</p>
        ) : (
          <ul className="afTables">
            {floor.tables.map((t) => (
              <li key={t.tableCode} className={`is${t.state}`}>
                <b>{t.tableCode}</b>
                <small>{STATE_LABEL[t.state]}</small>
                {t.players.length > 0 && <em>{t.players.join(", ")}</em>}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Open now */}
      <div className="afBlock">
        <div className="afHead">
          <h2>Open to SPILL now</h2>
          {floor && <span>{floor.open.length} people</span>}
        </div>
        {!floor ? null : floor.open.length === 0 ? (
          <p className="afMuted">Nobody is open right now.</p>
        ) : (
          <ul className="afRows">
            {floor.open.map((p) => (
              <li key={p.id}>
                <div>
                  <b>{p.displayName}</b>
                  <small>
                    {p.tableCode} · open {p.openMinutes} min · {p.minutesLeft}{" "}
                    min left
                  </small>
                </div>
                <div className="afTags">
                  {p.status === "PAUSED" && <i className="afTag">Paused</i>}
                  {p.away && p.status !== "PAUSED" && (
                    <i className="afTag">Away</i>
                  )}
                  {p.reports > 0 && (
                    <i className="afTag isAlert">
                      {p.reports} report{p.reports > 1 ? "s" : ""}
                    </i>
                  )}
                </div>
                <button
                  type="button"
                  disabled={busy === p.id}
                  onClick={() =>
                    post(
                      `/api/admin/open/${p.id}/hide`,
                      p.id,
                      `Take ${p.displayName} off the list?`,
                    )
                  }
                >
                  Take off list
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Reports */}
      <div className="afBlock">
        <div className="afHead">
          <h2>Reports</h2>
          {floor && (
            <span>{openReports.length} to review · last 24 hours shown</span>
          )}
        </div>
        {!floor ? null : floor.reports.length === 0 ? (
          <p className="afMuted">No reports. 🙌</p>
        ) : (
          <ul className="afRows">
            {floor.reports.map((r) => (
              <li
                key={r.id}
                className={r.status === "RESOLVED" ? "isDone" : undefined}
              >
                <div>
                  <b>
                    {r.reported.name} <small>({r.reported.tableCode})</small>
                  </b>
                  <small>
                    {time(r.createdAt)} · {REASON_LABEL[r.reason]} · reported by{" "}
                    {r.reporter.name} ({r.reporter.tableCode})
                  </small>
                  {r.note && <p className="afNote">“{r.note}”</p>}
                </div>
                <div className="afTags">
                  {r.status === "RESOLVED" ? (
                    <i className="afTag">Resolved</i>
                  ) : (
                    <i className="afTag isAlert">To review</i>
                  )}
                </div>
                <div className="afActions">
                  {r.reported.stillOpen && (
                    <button
                      type="button"
                      disabled={busy === r.reported.id}
                      onClick={() =>
                        post(
                          `/api/admin/open/${r.reported.id}/hide`,
                          r.reported.id,
                          `Take ${r.reported.name} off the list?`,
                        )
                      }
                    >
                      Take off list
                    </button>
                  )}
                  {r.status === "OPEN" && (
                    <button
                      type="button"
                      className="isPrimary"
                      disabled={busy === r.id}
                      onClick={() =>
                        post(`/api/admin/reports/${r.id}/resolve`, r.id)
                      }
                    >
                      Resolve
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
