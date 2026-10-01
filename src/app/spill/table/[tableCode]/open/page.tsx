"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { saveMe } from "@/lib/spill-device";
import {
  clearOpen,
  loadOpen,
  saveOpen,
  type DeviceOpen,
} from "@/lib/open-device";
import "../../../spill-game.css";

const POLL_MS = 2000;

type OpenState = {
  serverTime: string;
  me: {
    id: string;
    displayName: string;
    status: "OPEN" | "PAUSED" | "MATCHED" | "CLOSED";
    expiresAt: string;
    table: { code: string; name: string };
  };
  available: {
    id: string;
    displayName: string;
    openMinutes: number;
    busy: boolean;
  }[];
  incoming: {
    id: string;
    fromId: string;
    fromName: string;
    expiresAt: string;
  } | null;
  outgoing: { id: string; toName: string; expiresAt: string } | null;
  notAvailable: { name: string } | null;
  match: {
    partnerId: string;
    partnerName: string;
    iWalk: boolean;
    meetTable: { code: string; name: string };
    color: { name: string; hex: string; ink: string };
    code: string | null;
    session: { id: string; sessionCode: string; status: string };
    participantToken: string | null;
    playerName: string;
  } | null;
};

type ReportReason = "UNCOMFORTABLE" | "INAPPROPRIATE_NAME" | "SPAM" | "OTHER";

const REPORT_REASONS: { value: ReportReason; label: string }[] = [
  { value: "UNCOMFORTABLE", label: "They made me uncomfortable" },
  { value: "INAPPROPRIATE_NAME", label: "Inappropriate name" },
  { value: "SPAM", label: "Too many invites" },
  { value: "OTHER", label: "Something else" },
];

function secondsLeft(iso: string, now: number) {
  return Math.max(0, Math.ceil((new Date(iso).getTime() - now) / 1000));
}

function clock(total: number) {
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export default function OpenToSpillPage() {
  const params = useParams<{ tableCode: string }>();
  const tableCode = params.tableCode.toUpperCase();
  const router = useRouter();

  const [device, setDevice] = useState<DeviceOpen | null | undefined>(
    undefined,
  );
  const [state, setState] = useState<OpenState | null>(null);
  const [name, setName] = useState("");
  const [adult, setAdult] = useState(false);
  const [working, setWorking] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");
  const [now, setNow] = useState(0);
  const [reportTarget, setReportTarget] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [reportReason, setReportReason] = useState<ReportReason | null>(null);
  const [reportNote, setReportNote] = useState("");
  const skewRef = useRef(0);
  const lastNotAvailableRef = useRef("");

  useEffect(() => {
    const d = loadOpen();
    const mine = d && d.tableCode === tableCode ? d : null;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDevice(mine);
    if (d) setName(d.displayName);
  }, [tableCode]);

  const fetchState = useCallback(async () => {
    if (!device) return;
    try {
      const res = await fetch(
        `/api/open/state?token=${encodeURIComponent(device.token)}`,
        { cache: "no-store" },
      );
      if (res.status === 404) {
        clearOpen();
        setDevice(null);
        setState(null);
        return;
      }
      if (!res.ok) return;
      const json: OpenState = await res.json();
      skewRef.current = new Date(json.serverTime).getTime() - Date.now();
      setState(json);
    } catch {}
  }, [device]);

  useEffect(() => {
    if (!device) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchState();
    const id = setInterval(fetchState, POLL_MS);
    return () => clearInterval(id);
  }, [device, fetchState]);

  useEffect(() => {
    const tick = () => setNow(Date.now() + skewRef.current);
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const who = state?.notAvailable?.name ?? "";
    if (who && who !== lastNotAvailableRef.current) {
      setToast(`${who} isn't available right now.`);
    }
    lastNotAvailableRef.current = who;
  }, [state?.notAvailable?.name]);

  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(""), 3200);
    return () => clearTimeout(id);
  }, [toast]);

  const incomingId = state?.incoming?.id;
  const matched = !!state?.match;
  useEffect(() => {
    if (incomingId || matched) {
      try {
        navigator.vibrate?.(matched ? [80, 60, 80] : [60, 40, 60]);
      } catch {}
    }
  }, [incomingId, matched]);

  async function call(path: string, body: object) {
    const res = await fetch(path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const json = await res.json().catch(() => ({}));
    return { ok: res.ok, json };
  }

  async function goOpen() {
    const displayName = name.trim();
    if (!displayName || !adult || working) return;
    setWorking(true);
    setError("");
    try {
      const previous = loadOpen();
      const { ok, json } = await call("/api/open", {
        tableCode,
        displayName,
        ageConfirmed: true,
        ...(previous ? { previousToken: previous.token } : {}),
      });
      if (!ok) {
        setError(json.error?.message ?? "Couldn't reach SPILL. Try again.");
        return;
      }
      const d: DeviceOpen = {
        id: json.presence.id,
        token: json.presence.token,
        displayName: json.presence.displayName,
        tableCode,
      };
      saveOpen(d);
      setState(null);
      setDevice(d);
    } catch {
      setError("Connection issue — try again.");
    } finally {
      setWorking(false);
    }
  }

  async function act(path: string, body: object, failMessage?: string) {
    if (!device || working) return;
    setWorking(true);
    try {
      const { ok, json } = await call(path, { token: device.token, ...body });
      if (!ok && failMessage !== "") {
        setToast(json.error?.message ?? failMessage ?? "Try again.");
      }
    } catch {
      setToast("Connection issue — try again.");
    } finally {
      setWorking(false);
      fetchState();
    }
  }

  async function leave() {
    await act("/api/open/close", {}, "");
  }

  async function setPaused(paused: boolean) {
    await act("/api/open/pause", { paused });
  }

  function openReport(id: string, name: string) {
    setReportTarget({ id, name });
    setReportReason(null);
    setReportNote("");
  }

  async function sendReport() {
    if (!device || !reportTarget || !reportReason || working) return;
    setWorking(true);
    try {
      const { ok, json } = await call("/api/open/report", {
        token: device.token,
        targetId: reportTarget.id,
        reason: reportReason,
        ...(reportNote.trim() ? { note: reportNote.trim() } : {}),
      });
      if (ok) {
        setReportTarget(null);
        setToast("Thanks for telling us. Staff will take a look.");
      } else {
        setToast(json.error?.message ?? "Couldn't send. Try again.");
      }
    } catch {
      setToast("Connection issue — try again.");
    } finally {
      setWorking(false);
      fetchState();
    }
  }

  // Shared by the list, the invite card and the meet screen.
  const reportSheet = reportTarget && (
    <div className="opInvite" role="dialog" aria-modal="true">
      <div className="opInviteCard opReport">
        <span className="opKicker">Report</span>
        <h2>Report {reportTarget.name}</h2>
        <p>
          They won&apos;t be told. You won&apos;t see each other again tonight,
          and SPILL staff will take a look.
        </p>
        <div className="opReasons" role="radiogroup">
          {REPORT_REASONS.map((r) => (
            <label key={r.value} className="opCheck">
              <input
                type="radio"
                name="reportReason"
                checked={reportReason === r.value}
                onChange={() => setReportReason(r.value)}
              />
              <span>{r.label}</span>
            </label>
          ))}
        </div>
        <textarea
          className="opNoteField"
          rows={3}
          maxLength={300}
          value={reportNote}
          placeholder="Anything staff should know? (optional)"
          aria-label="Anything staff should know? (optional)"
          onChange={(event) => setReportNote(event.target.value)}
        />
        <div className="opInviteActions">
          <button
            className="s42Primary"
            type="button"
            disabled={working || !reportReason}
            onClick={sendReport}
          >
            Send report <span>→</span>
          </button>
          <button
            className="opNotNow"
            type="button"
            disabled={working}
            onClick={() => setReportTarget(null)}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );

  function startGame() {
    if (!state?.match?.participantToken) return;
    const m = state.match;
    saveMe({
      sessionId: m.session.id,
      sessionCode: m.session.sessionCode,
      token: m.participantToken!,
      name: m.playerName,
      homeTable: tableCode,
    });
    router.push(`/spill/${m.session.sessionCode}`);
  }

  // ── Loading ─────────
  if (device === undefined || (device && !state)) {
    return (
      <main className="s42App">
        <section className="s42Intro">
          <div className="s42IntroContent">
            <p>Real conversation. Real connection.</p>
            <h1>Looking around the room…</h1>
          </div>
        </section>
      </main>
    );
  }

  const status = state?.me.status;

  // ── 1. Setup (or 4. closed → open again) ─────────────────────
  if (!device || !state || status === "CLOSED") {
    const reopening = status === "CLOSED";
    return (
      <main className="s42App sgApp opApp">
        <section className="s42Setup">
          <div className="s42SetupPanel">
            <Link className="s42Back" href={`/spill/table/${tableCode}`}>
              ← Back
            </Link>
            <div className="s42SetupHeading">
              <span>
                {reopening ? "You're not listed" : "Meet someone new"}
              </span>
              <h1>{reopening ? "Open again?" : "Open to SPILL?"}</h1>
              <p>
                See who else here tonight is up for a SPILL, and let them see
                you.
              </p>
            </div>

            <ul className="opRules">
              <li>Only your first name is shown.</li>
              <li>Your table stays private until you both say yes.</li>
              <li>Pause or leave anytime. It switches off after 45 minutes.</li>
            </ul>

            <form
              className="s42NameForm"
              onSubmit={(event) => {
                event.preventDefault();
                goOpen();
              }}
            >
              <input
                type="text"
                value={name}
                maxLength={20}
                autoComplete="given-name"
                placeholder="Your first name"
                aria-label="Your first name"
                onChange={(event) => setName(event.target.value)}
              />
            </form>

            <label className="opCheck">
              <input
                type="checkbox"
                checked={adult}
                onChange={(event) => setAdult(event.target.checked)}
              />
              <span>I&apos;m 18 or older</span>
            </label>

            {error && <p className="s42Permission">{error}</p>}

            <button
              className="s42Primary"
              type="button"
              disabled={working || !name.trim() || !adult}
              onClick={goOpen}
            >
              {working ? "Opening…" : "I'm open to SPILL"} <span>→</span>
            </button>
          </div>
        </section>
      </main>
    );
  }

  // ── 3. Meet ──────────────────────────────────────────────────
  if (status === "MATCHED" && state.match) {
    const m = state.match;
    const ended = m.session.status === "ENDED";
    return (
      <main
        className="s42App sgApp opApp opMeet"
        style={{
          ["--meet" as string]: m.color.hex,
          ["--meet-ink" as string]: m.color.ink,
        }}
      >
        <section className="opMeetInner">
          <span className="opKicker">It&apos;s a SPILL</span>
          <div className="opBadge" aria-label={`${m.color.name} ${m.code}`}>
            {m.code}
          </div>
          <p className="opColor">{m.color.name} screen</p>

          {ended ? (
            <>
              <h1>That SPILL has ended</h1>
              <p className="opLead">Hope it was a good one.</p>
              <button
                className="s42Primary"
                type="button"
                onClick={() => {
                  clearOpen();
                  router.push(`/spill/table/${tableCode}`);
                }}
              >
                Back to your table <span>→</span>
              </button>
            </>
          ) : (
            <>
              <h1>
                {m.iWalk
                  ? `Walk over to ${m.meetTable.name}`
                  : `${m.partnerName} is on the way`}
              </h1>
              <p className="opLead">
                {m.iWalk
                  ? `${m.partnerName} is waiting there. Look for the ${m.color.name.toLowerCase()} screen with ${m.code}.`
                  : `Keep this screen up so ${m.partnerName} can find you — ${m.color.name.toLowerCase()}, ${m.code}.`}
              </p>
              <button
                className="s42Primary"
                type="button"
                disabled={!m.participantToken}
                onClick={startGame}
              >
                We found each other <span>→</span>
              </button>
              <p className="s42Permission">
                Sit wherever you like — the game runs on your phones.
              </p>
              <button
                className="opReportLink"
                type="button"
                onClick={() => openReport(m.partnerId, m.partnerName)}
              >
                Something wrong? Report {m.partnerName}
              </button>
            </>
          )}
        </section>
        {reportSheet}
        {toast && (
          <div className="sgToast" role="status">
            {toast}
          </div>
        )}
      </main>
    );
  }

  const leftOpen = secondsLeft(state.me.expiresAt, now);

  // ── 2b. Paused: still open, but nobody can see or invite you ──
  if (status === "PAUSED") {
    return (
      <main className="s42App sgApp opApp">
        <section className="s42Setup">
          <div className="s42SetupPanel">
            <div className="opTop">
              <span className="opLive isPaused">
                <i aria-hidden="true" /> Paused · {state.me.displayName}
              </span>
            </div>
            <div className="s42SetupHeading">
              <span>Still yours for {Math.ceil(leftOpen / 60)} more min</span>
              <h1>You&apos;re paused</h1>
              <p>
                Nobody can see you or invite you right now. Come back whenever
                you&apos;re ready.
              </p>
            </div>
            <button
              className="s42Primary"
              type="button"
              disabled={working}
              onClick={() => setPaused(false)}
            >
              Show me again <span>→</span>
            </button>
            <button
              className="opNotNow opLeave"
              type="button"
              disabled={working}
              onClick={leave}
            >
              Leave for tonight
            </button>
          </div>
        </section>
        {toast && (
          <div className="sgToast" role="status">
            {toast}
          </div>
        )}
      </main>
    );
  }

  // ── 2. Open: the list, invites ───────────────────────────────
  const incoming = state.incoming;
  const outgoing = state.outgoing;

  return (
    <main className="s42App sgApp opApp">
      <section className="s42Setup">
        <div className="s42SetupPanel">
          <div className="opTop">
            <span className="opLive">
              <i aria-hidden="true" /> Open · {state.me.displayName}
            </span>
            <div className="opTopActions">
              <button
                className="opHide"
                type="button"
                disabled={working}
                onClick={() => setPaused(true)}
              >
                Pause
              </button>
              <button
                className="opHide"
                type="button"
                disabled={working}
                onClick={leave}
              >
                Leave
              </button>
            </div>
          </div>

          <div className="s42SetupHeading">
            <span>Open for {Math.ceil(leftOpen / 60)} more min</span>
            <h1>Who&apos;s here tonight</h1>
            <p>Invite someone. If they say yes, you&apos;ll meet in person.</p>
          </div>

          {outgoing && (
            <div className="opPending" role="status">
              <div>
                <b>Waiting for {outgoing.toName}…</b>
                <small>{clock(secondsLeft(outgoing.expiresAt, now))}</small>
              </div>
              <button
                type="button"
                disabled={working}
                onClick={() =>
                  act(`/api/open/invites/${outgoing.id}/cancel`, {}, "")
                }
              >
                Cancel
              </button>
            </div>
          )}

          {state.available.length === 0 ? (
            <div className="opEmpty">
              <p>No one else is open right now.</p>
              <small>
                Stay on this screen — people show up here as soon as they open.
              </small>
              <div className="sgPulseDots" aria-hidden="true">
                <i />
                <i />
                <i />
              </div>
            </div>
          ) : (
            <ul className="opList">
              {state.available.map((p) => (
                <li key={p.id}>
                  <div>
                    <b>{p.displayName}</b>
                    <small>
                      {p.busy
                        ? "Answering an invite"
                        : p.openMinutes < 1
                          ? "Just opened"
                          : `Open for ${p.openMinutes} min`}
                    </small>
                  </div>
                  <button
                    className="opFlag"
                    type="button"
                    aria-label={`Report ${p.displayName}`}
                    title={`Report ${p.displayName}`}
                    onClick={() => openReport(p.id, p.displayName)}
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
                      <line x1="4" y1="22" x2="4" y2="15" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    disabled={working || !!outgoing || !!incoming || p.busy}
                    onClick={() =>
                      act("/api/open/invites", { toId: p.id }, undefined)
                    }
                  >
                    {p.busy ? "Busy" : "Invite"}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {/* Incoming invite — on top of everything. */}
      {incoming && (
        <div className="opInvite" role="dialog" aria-modal="true">
          <div className="opInviteCard">
            <span className="opKicker">New invite</span>
            <h2>{incoming.fromName} wants to SPILL with you</h2>
            <p>
              Say yes and {incoming.fromName} walks over to your table. Your
              table is only shared if you accept.
            </p>
            <small>
              {clock(secondsLeft(incoming.expiresAt, now))} to answer
            </small>
            <div className="opInviteActions">
              <button
                className="s42Primary"
                type="button"
                disabled={working}
                onClick={() =>
                  act(`/api/open/invites/${incoming.id}/respond`, {
                    accept: true,
                  })
                }
              >
                Accept <span>→</span>
              </button>
              <button
                className="opNotNow"
                type="button"
                disabled={working}
                onClick={() =>
                  act(`/api/open/invites/${incoming.id}/respond`, {
                    accept: false,
                  })
                }
              >
                Not now
              </button>
            </div>
            <button
              className="opReportLink"
              type="button"
              onClick={() => openReport(incoming.fromId, incoming.fromName)}
            >
              Report {incoming.fromName}
            </button>
          </div>
        </div>
      )}

      {reportSheet}

      {toast && (
        <div className="sgToast" role="status">
          {toast}
        </div>
      )}
    </main>
  );
}
