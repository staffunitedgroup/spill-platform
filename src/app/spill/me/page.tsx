"use client";

// Phase 3 · "Your SPILL" — connections and notification settings.
// Not signed in → ask for a sign-in link.
import { useCallback, useEffect, useState } from "react";
import "../spill-game.css";

type Me = {
  guest: {
    email: string;
    displayName: string | null;
    emailNotifications: boolean;
    notificationsPaused: boolean;
  };
  connections: { id: string; name: string; since: string; notify: boolean }[];
  hereTonight: { id: string; name: string; at: string; openNow: boolean }[];
};

function since(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function Switch({
  checked,
  label,
  hint,
  disabled,
  onChange,
}: {
  checked: boolean;
  label: string;
  hint?: string;
  disabled?: boolean;
  onChange: (next: boolean) => void;
}) {
  return (
    <label className="meSwitch">
      <span>
        <b>{label}</b>
        {hint && <small>{hint}</small>}
      </span>
      <input
        type="checkbox"
        role="switch"
        checked={checked}
        disabled={disabled}
        onChange={(event) => onChange(event.target.checked)}
      />
    </label>
  );
}

export default function MySpillPage() {
  const [me, setMe] = useState<Me | null | undefined>(undefined);
  const [working, setWorking] = useState(false);
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState<{ to: string; devLink?: string } | null>(
    null,
  );
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/me", { cache: "no-store" });
      setMe(res.ok ? await res.json() : null);
    } catch {
      setMe(null);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  async function post(path: string, body?: object) {
    setWorking(true);
    setError("");
    try {
      const res = await fetch(path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: body ? JSON.stringify(body) : undefined,
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) setError(json.error?.message ?? "Try again.");
      return res.ok ? json : null;
    } catch {
      setError("Connection issue — try again.");
      return null;
    } finally {
      setWorking(false);
    }
  }

  async function sendLink() {
    const json = await post("/api/auth/request", { email: email.trim() });
    if (json) setSent({ to: json.sentTo, devLink: json.devLink });
  }

  // ── Loading ──
  if (me === undefined) {
    return (
      <main className="s42App">
        <section className="s42Intro">
          <div className="s42IntroContent">
            <h1>Your SPILL…</h1>
          </div>
        </section>
      </main>
    );
  }

  // ── Not signed in ──
  if (me === null) {
    return (
      <main className="s42App sgApp opApp">
        <section className="s42Setup">
          <div className="s42SetupPanel">
            <div className="s42SetupHeading">
              <span>Your SPILL</span>
              <h1>Sign in</h1>
              <p>
                See your SPILL connections and choose when we let you know
                they&apos;re back. We email you a one-time link — no password.
              </p>
            </div>
            {sent ? (
              <div className="scCard">
                <h2>Check your email</h2>
                <p>
                  We sent a sign-in link to <b>{sent.to}</b>. It works for 20
                  minutes.
                </p>
                {sent.devLink && (
                  <a className="scLink" href={sent.devLink}>
                    Open sign-in link (testing only) →
                  </a>
                )}
              </div>
            ) : (
              <form
                className="scForm"
                onSubmit={(event) => {
                  event.preventDefault();
                  sendLink();
                }}
              >
                <input
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  value={email}
                  placeholder="Your email"
                  aria-label="Your email"
                  onChange={(event) => setEmail(event.target.value)}
                />
                <button
                  className="s42Primary"
                  type="submit"
                  disabled={working || !email.trim()}
                >
                  {working ? "Sending…" : "Send my link"} <span>→</span>
                </button>
              </form>
            )}
            {error && <p className="scError">{error}</p>}
          </div>
        </section>
      </main>
    );
  }

  // ── Signed in ──
  const { guest, connections, hereTonight } = me;
  return (
    <main className="s42App sgApp opApp">
      <section className="s42Setup">
        <div className="s42SetupPanel meSpill">
          <div className="s42SetupHeading">
            <span>{guest.email}</span>
            <h1>Your SPILL</h1>
            <p>
              People you both chose to stay connected with. When one of you is
              at SPILL and open to SPILL, the other gets a nudge — max once a
              day. No chat, ever.
            </p>
          </div>

          {hereTonight.length > 0 && (
            <div className="htBanner">
              {hereTonight.map((h) => (
                <p key={h.id}>
                  <b>{h.name}</b> is at SPILL tonight
                  {h.openNow ? " and open to SPILL right now." : "."}
                </p>
              ))}
            </div>
          )}

          <h2 className="meTitle">Connections</h2>
          {connections.length === 0 ? (
            <p className="meEmpty">
              No connections yet. After a SPILL where you both choose Stay
              Connected, they show up here.
            </p>
          ) : (
            <ul className="meList">
              {connections.map((c) => (
                <li key={c.id}>
                  <div className="meWho">
                    <b>{c.name}</b>
                    <small>Since {since(c.since)}</small>
                  </div>
                  <Switch
                    checked={c.notify}
                    label="Tell me when they're back"
                    disabled={working}
                    onChange={async (notify) => {
                      if (await post(`/api/me/connections/${c.id}`, { notify }))
                        load();
                    }}
                  />
                  <button
                    className="opReportLink meRemove"
                    type="button"
                    disabled={working}
                    onClick={async () => {
                      if (
                        !confirm(
                          `Remove ${c.name}? Neither of you will be told when the other is back. They won't be notified that you removed them.`,
                        )
                      )
                        return;
                      if (
                        await post(`/api/me/connections/${c.id}`, {
                          remove: true,
                        })
                      )
                        load();
                    }}
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          )}

          <h2 className="meTitle">Notifications</h2>
          <div className="meSettings">
            <Switch
              checked={!guest.notificationsPaused}
              label="Notifications on"
              hint="Turn off to pause everything, for everyone."
              disabled={working}
              onChange={async (on) => {
                if (
                  await post("/api/me/settings", { notificationsPaused: !on })
                )
                  load();
              }}
            />
            <Switch
              checked={guest.emailNotifications}
              label="Email me too"
              hint="Off = you only see it when you scan in at SPILL."
              disabled={working || guest.notificationsPaused}
              onChange={async (on) => {
                if (await post("/api/me/settings", { emailNotifications: on }))
                  load();
              }}
            />
          </div>

          {error && <p className="scError">{error}</p>}

          <div className="meFooter">
            <button
              className="opNotNow"
              type="button"
              disabled={working}
              onClick={async () => {
                if (await post("/api/auth/logout")) load();
              }}
            >
              Sign out on this phone
            </button>
            <button
              className="opReportLink"
              type="button"
              disabled={working}
              onClick={async () => {
                if (
                  !confirm(
                    "Delete your SPILL account? Your email, connections and notifications are removed for good.",
                  )
                )
                  return;
                if (await post("/api/me/delete")) load();
              }}
            >
              Delete my account
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
