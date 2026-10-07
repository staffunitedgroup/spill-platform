"use client";

import Link from "next/link";
import { useCallback, useEffect, useState, type FormEvent } from "react";
import { locations } from "@/lib/site-data";

type Signup = {
  id: string;
  email: string;
  name: string | null;
  whatsapp: string | null;
  locationSlug: string;
  interests: string[];
  source: string | null;
  createdAt: string;
  updatedAt: string;
};

/** Signed up again (or RSVP'd to an event) after joining — worth a second look. */
function wasUpdated(s: { createdAt: string; updatedAt: string }) {
  return new Date(s.updatedAt).getTime() - new Date(s.createdAt).getTime() > 60_000;
}

// Shared with /admin so staff only sign in once.
const PASSWORD_KEY = "spill-admin-password";

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function WaitlistAdminPage() {
  const [password, setPassword] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [location, setLocation] = useState("");
  const [signups, setSignups] = useState<Signup[] | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    try {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPassword(localStorage.getItem(PASSWORD_KEY));
    } catch {
      /* storage blocked — they'll sign in below */
    }
    setReady(true);
  }, []);

  const load = useCallback(async (pwd: string, loc: string) => {
    setError("");
    const res = await fetch(`/api/admin/waitlist${loc ? `?location=${loc}` : ""}`, {
      headers: { "x-admin-password": pwd },
      cache: "no-store",
    });
    if (res.status === 401) {
      try {
        localStorage.removeItem(PASSWORD_KEY);
      } catch {}
      setPassword(null);
      setError("Incorrect password.");
      return;
    }
    if (!res.ok) {
      setError("Could not load the waitlist. Please try again.");
      return;
    }
    const json = await res.json();
    setSignups(json.signups);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (password) load(password, location);
  }, [password, location, load]);

  function signIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = String(new FormData(event.currentTarget).get("password") ?? "").trim();
    if (!value) return;
    try {
      localStorage.setItem(PASSWORD_KEY, value);
    } catch {}
    setPassword(value);
  }

  async function downloadCsv() {
    if (!password) return;
    const params = new URLSearchParams({ format: "csv" });
    if (location) params.set("location", location);
    const res = await fetch(`/api/admin/waitlist?${params}`, {
      headers: { "x-admin-password": password },
    });
    if (!res.ok) {
      setError("Could not export the CSV.");
      return;
    }
    const url = URL.createObjectURL(await res.blob());
    const a = document.createElement("a");
    a.href = url;
    a.download = `spill-waitlist${location ? `-${location}` : ""}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  if (!ready) return null;

  return (
    <main className="interiorPage adminWaitlist">
      <header className="adminWaitlistHead">
        <div>
          <span className="eyebrow">SPILL Admin</span>
          <h1>Waitlist</h1>
          <p>People who asked for opening news from the website.</p>
        </div>
        <nav className="adminLinks">
          <Link href="/admin">← Active tables</Link>
          <Link href="/admin/events">Events</Link>
        </nav>
      </header>

      {!password ? (
        <form className="inquiryForm adminWaitlistLogin" onSubmit={signIn}>
          <label>
            Admin password
            <input name="password" type="password" autoComplete="current-password" required />
          </label>
          <button className="button primary" type="submit">
            Enter <span>→</span>
          </button>
          {error && <p className="formStatus waitlistStatus error">{error}</p>}
        </form>
      ) : (
        <>
          <div className="adminWaitlistBar">
            <label>
              Location
              <select value={location} onChange={(e) => setLocation(e.target.value)}>
                <option value="">All locations</option>
                {locations.map((l) => (
                  <option key={l.slug} value={l.slug}>
                    {l.name}
                  </option>
                ))}
              </select>
            </label>
            <strong>{signups ? `${signups.length} sign-up${signups.length === 1 ? "" : "s"}` : "Loading…"}</strong>
            <button className="button primary" type="button" onClick={downloadCsv} disabled={!signups?.length}>
              Download CSV
            </button>
          </div>
          {error && <p className="formStatus waitlistStatus error">{error}</p>}
          {signups && signups.length === 0 && <p className="adminWaitlistEmpty">No sign-ups yet.</p>}
          {signups && signups.length > 0 && (
            <div className="adminWaitlistTableWrap">
              <table className="adminWaitlistTable">
                <thead>
                  <tr>
                    <th>Signed up</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>WhatsApp</th>
                    <th>Location</th>
                    <th>Interests</th>
                    <th>Source</th>
                  </tr>
                </thead>
                <tbody>
                  {signups.map((s) => (
                    <tr key={s.id}>
                      <td data-label="Signed up">
                        {formatDate(s.createdAt)}
                        {wasUpdated(s) && <small className="adminUpdated">↻ Updated {formatDate(s.updatedAt)}</small>}
                      </td>
                      <td data-label="Name">{s.name || "—"}</td>
                      <td data-label="Email">
                        <a href={`mailto:${s.email}`}>{s.email}</a>
                      </td>
                      <td data-label="WhatsApp">{s.whatsapp || "—"}</td>
                      <td data-label="Location">{s.locationSlug}</td>
                      <td data-label="Interests">{s.interests.join(", ") || "—"}</td>
                      <td data-label="Source">
                        <SourceLabel source={s.source} location={s.locationSlug} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </main>
  );
}

/** "event:founder-night" → a link to that event; "global-home" → "Homepage sign-up"; "saigon-home" → "Waitlist form". */
function SourceLabel({ source, location }: { source: string | null; location: string }) {
  if (source?.startsWith("event:")) {
    const slug = source.slice("event:".length);
    return (
      <a href={`/${location}/whats-on/${slug}`} target="_blank" rel="noreferrer">
        Event: {slug} ↗
      </a>
    );
  }
  if (source === "global-home") return <>Homepage sign-up</>;
  if (source) return <>Waitlist form</>;
  return <>—</>;
}
