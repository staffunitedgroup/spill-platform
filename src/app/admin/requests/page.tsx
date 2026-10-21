"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { AdminSignIn, useAdminPassword } from "@/components/admin-access";
import {
  KIND_META,
  REQUEST_KINDS,
  REQUEST_STATUSES,
  STATUS_LABEL,
  type RequestField,
  type RequestKindKey,
  type RequestStatusKey,
} from "@/lib/booking-meta";

type BookingRequest = {
  id: string;
  kind: RequestKindKey;
  name: string;
  email: string;
  whatsapp: string | null;
  summary: string;
  fields: RequestField[];
  status: RequestStatusKey;
  notes: string;
  createdAt: string;
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("en-GB", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
}

/** wa.me wants digits only. */
function whatsappLink(phone: string) {
  return `https://wa.me/${phone.replace(/\D/g, "")}`;
}

export default function RequestsAdminPage() {
  const [password, setPassword] = useAdminPassword();
  const [kind, setKind] = useState("");
  const [status, setStatus] = useState("");
  const [requests, setRequests] = useState<BookingRequest[] | null>(null);
  const [newCount, setNewCount] = useState(0);
  const [error, setError] = useState("");
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [savedNote, setSavedNote] = useState<string | null>(null);

  const api = useCallback(
    async (path: string, init?: RequestInit) => {
      const res = await fetch(path, {
        ...init,
        headers: { "Content-Type": "application/json", "x-admin-password": password ?? "", ...init?.headers },
        cache: "no-store",
      });
      if (res.status === 401) {
        setPassword(null);
        setError("Incorrect password.");
      }
      return res;
    },
    [password, setPassword],
  );

  const query = useCallback(
    (extra?: Record<string, string>) => {
      const params = new URLSearchParams(extra);
      if (kind) params.set("kind", kind);
      if (status) params.set("status", status);
      const q = params.toString();
      return `/api/admin/requests${q ? `?${q}` : ""}`;
    },
    [kind, status],
  );

  const load = useCallback(async () => {
    if (!password) return;
    const res = await api(query());
    if (!res.ok) {
      if (res.status !== 401) setError("Could not load requests. Please try again.");
      return;
    }
    setError("");
    const json = await res.json();
    setRequests(json.requests);
    setNewCount(json.newCount);
    setNotes(Object.fromEntries((json.requests as BookingRequest[]).map((r) => [r.id, r.notes])));
  }, [api, password, query]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  async function update(r: BookingRequest, data: { status?: RequestStatusKey; notes?: string }) {
    const res = await api(`/api/admin/requests/${r.id}`, { method: "PATCH", body: JSON.stringify(data) });
    if (!res.ok) return setError("Could not save that change. Please try again.");
    if (data.notes !== undefined) {
      setSavedNote(r.id);
      setTimeout(() => setSavedNote((id) => (id === r.id ? null : id)), 2000);
    }
    load();
  }

  async function remove(r: BookingRequest) {
    if (!confirm(`Delete the request from ${r.name} (${r.email})? This can't be undone.`)) return;
    const res = await api(`/api/admin/requests/${r.id}`, { method: "DELETE" });
    if (!res.ok && res.status !== 404) return setError("Could not delete that request. Please try again.");
    load();
  }

  async function downloadCsv() {
    const res = await api(query({ format: "csv" }));
    if (!res.ok) return setError("Could not export the CSV.");
    const url = URL.createObjectURL(await res.blob());
    const a = document.createElement("a");
    a.href = url;
    a.download = "spill-requests.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  if (password === undefined) return null;

  return (
    <main className="interiorPage adminWaitlist adminRequests">
      <header className="adminWaitlistHead">
        <div>
          <span className="eyebrow">SPILL Admin</span>
          <h1>Requests</h1>
          <p>Every website form — livestream, podcast, Confessional, private events, partnerships, investors and contact messages.</p>
        </div>
        <nav className="adminLinks">
          <Link href="/admin">← Active tables</Link>
          <Link href="/admin/events">Events</Link>
          <Link href="/admin/waitlist">Waitlist</Link>
        </nav>
      </header>

      {!password ? (
        <AdminSignIn onSignIn={setPassword} error={error} />
      ) : (
        <>
          <div className="adminWaitlistBar">
            <label>
              Type
              <select value={kind} onChange={(e) => setKind(e.target.value)}>
                <option value="">All requests</option>
                {REQUEST_KINDS.map((k) => (
                  <option key={k} value={k}>
                    {KIND_META[k].label}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Status
              <select value={status} onChange={(e) => setStatus(e.target.value)}>
                <option value="">Any status</option>
                {REQUEST_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {STATUS_LABEL[s]}
                  </option>
                ))}
              </select>
            </label>
            <strong>
              {requests ? `${requests.length} request${requests.length === 1 ? "" : "s"}` : "Loading…"}
              {newCount > 0 && <span className="adminNewBadge">{newCount} new</span>}
            </strong>
            <button className="button primary" type="button" onClick={downloadCsv} disabled={!requests?.length}>
              Download CSV
            </button>
          </div>
          {error && <p className="formStatus waitlistStatus error">{error}</p>}
          {requests && requests.length === 0 && <p className="adminWaitlistEmpty">No requests yet.</p>}

          <div className="requestList">
            {requests?.map((r) => (
              <article key={r.id} className={`requestCard status-${r.status.toLowerCase()}`}>
                <header>
                  <div>
                    <p className="requestKind">
                      {KIND_META[r.kind].label} · <time>{formatDate(r.createdAt)}</time>
                    </p>
                    <h2>{r.name}</h2>
                    <p className="requestContact">
                      <a href={`mailto:${r.email}`}>{r.email}</a>
                      {r.whatsapp && (
                        <>
                          {" · "}
                          <a href={whatsappLink(r.whatsapp)} target="_blank" rel="noreferrer">
                            {r.whatsapp} ↗
                          </a>
                        </>
                      )}
                    </p>
                  </div>
                  <label className="requestStatus">
                    <span>Status</span>
                    <select value={r.status} onChange={(e) => update(r, { status: e.target.value as RequestStatusKey })}>
                      {REQUEST_STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {STATUS_LABEL[s]}
                        </option>
                      ))}
                    </select>
                  </label>
                </header>

                {r.summary && <p className="requestSummary">{r.summary}</p>}
                {r.fields.length > 0 && (
                  <dl className="requestFields">
                    {r.fields.map((f, i) => (
                      <div key={`${f.label}-${i}`}>
                        <dt>{f.label}</dt>
                        <dd>{f.value}</dd>
                      </div>
                    ))}
                  </dl>
                )}

                <footer>
                  <label className="requestNotes">
                    <span>Team notes</span>
                    <textarea
                      rows={2}
                      value={notes[r.id] ?? ""}
                      placeholder="e.g. Called on Tue, sending a quote"
                      onChange={(e) => setNotes((n) => ({ ...n, [r.id]: e.target.value }))}
                    />
                  </label>
                  <div className="requestActions">
                    <button
                      type="button"
                      className="adminLinkBtn"
                      disabled={(notes[r.id] ?? "") === r.notes}
                      onClick={() => update(r, { notes: notes[r.id] ?? "" })}
                    >
                      {savedNote === r.id ? "Saved ✓" : "Save note"}
                    </button>
                    <button type="button" className="adminLinkBtn danger" onClick={() => remove(r)}>
                      Delete
                    </button>
                  </div>
                </footer>
              </article>
            ))}
          </div>
        </>
      )}
    </main>
  );
}
