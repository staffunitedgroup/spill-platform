"use client";

import Link from "next/link";
import { Fragment, useCallback, useEffect, useState, type FormEvent } from "react";
import { AdminSignIn, useAdminPassword } from "@/components/admin-access";
import {
  CATEGORY_META,
  EVENT_CATEGORIES,
  eventImage,
  formatEventWhen,
  toLocalInputValue,
  type EventCategoryKey,
  youtubeId,
} from "@/lib/event-meta";
import { getLocation, locations } from "@/lib/site-data";

type AdminEvent = {
  id: string;
  locationSlug: string;
  slug: string;
  title: string;
  summary: string;
  description: string;
  category: EventCategoryKey;
  startsAt: string;
  endsAt: string | null;
  imageUrl: string | null;
  ticketUrl: string | null;
  youtubeUrl: string | null;
  rsvpEnabled: boolean;
  featured: boolean;
  published: boolean;
  rsvps: number;
  people: number;
  /** Finished — worked out when the list loads. */
  past?: boolean;
};

type Rsvp = { id: string; name: string; email: string; whatsapp: string | null; partySize: number; createdAt: string; updatedAt: string };

const EMPTY_FORM = {
  locationSlug: "saigon",
  title: "",
  slug: "",
  summary: "",
  description: "",
  category: "COMMUNITY" as EventCategoryKey,
  startsAt: "",
  endsAt: "",
  imageUrl: "",
  ticketUrl: "",
  youtubeUrl: "",
  rsvpEnabled: true,
  featured: false,
  published: false,
};
type FormState = typeof EMPTY_FORM;

function tzOf(slug: string) {
  return getLocation(slug)?.timezone ?? "Asia/Ho_Chi_Minh";
}

function toForm(e: AdminEvent): FormState {
  const tz = tzOf(e.locationSlug);
  return {
    locationSlug: e.locationSlug,
    title: e.title,
    slug: e.slug,
    summary: e.summary,
    description: e.description,
    category: e.category,
    startsAt: toLocalInputValue(new Date(e.startsAt), tz),
    endsAt: e.endsAt ? toLocalInputValue(new Date(e.endsAt), tz) : "",
    imageUrl: e.imageUrl ?? "",
    ticketUrl: e.ticketUrl ?? "",
    youtubeUrl: e.youtubeUrl ?? "",
    rsvpEnabled: e.rsvpEnabled,
    featured: e.featured,
    published: e.published,
  };
}

export default function EventsAdminPage() {
  const [password, setPassword] = useAdminPassword();
  const [location, setLocation] = useState("");
  const [events, setEvents] = useState<AdminEvent[] | null>(null);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState<{ id: string | null; form: FormState } | null>(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [guestList, setGuestList] = useState<{ eventId: string; rsvps: Rsvp[] } | null>(null);

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

  const load = useCallback(async () => {
    if (!password) return;
    const res = await api(`/api/admin/events${location ? `?location=${location}` : ""}`);
    if (!res.ok) {
      if (res.status !== 401) setError("Could not load events. Please try again.");
      return;
    }
    setError("");
    const now = Date.now();
    const list: AdminEvent[] = (await res.json()).events;
    setEvents(
      list.map((e) => ({
        ...e,
        past: new Date(e.endsAt ?? new Date(e.startsAt).getTime() + 3 * 3600_000).getTime() < now,
      })),
    );
  }, [api, location, password]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editing) return;
    setSaving(true);
    setFormError("");
    const res = await api(editing.id ? `/api/admin/events/${editing.id}` : "/api/admin/events", {
      method: editing.id ? "PUT" : "POST",
      body: JSON.stringify(editing.form),
    });
    setSaving(false);
    if (!res.ok) {
      const body = await res.json().catch(() => null);
      setFormError(body?.error?.message ?? "Could not save the event.");
      return;
    }
    setEditing(null);
    load();
  }

  async function toggle(e: AdminEvent, field: "published" | "featured") {
    await api(`/api/admin/events/${e.id}`, { method: "PATCH", body: JSON.stringify({ [field]: !e[field] }) });
    load();
  }

  async function remove(e: AdminEvent) {
    const extra = e.rsvps ? ` Its ${e.rsvps} RSVP(s) will be removed too (they stay on the waitlist).` : "";
    if (!confirm(`Delete “${e.title}”?${extra}`)) return;
    await api(`/api/admin/events/${e.id}`, { method: "DELETE" });
    load();
  }

  async function showGuests(e: AdminEvent) {
    if (guestList?.eventId === e.id) return setGuestList(null);
    const res = await api(`/api/admin/events/${e.id}/rsvps`);
    if (res.ok) setGuestList({ eventId: e.id, rsvps: (await res.json()).rsvps });
  }

  async function downloadGuests(e: AdminEvent) {
    const res = await api(`/api/admin/events/${e.id}/rsvps?format=csv`);
    if (!res.ok) return setError("Could not export the guest list.");
    const url = URL.createObjectURL(await res.blob());
    const a = document.createElement("a");
    a.href = url;
    a.download = `spill-rsvps-${e.slug}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setEditing((cur) => (cur ? { ...cur, form: { ...cur.form, [key]: value } } : cur));
  }

  if (password === undefined) return null;

  return (
    <main className="interiorPage adminWaitlist adminEvents">
      <header className="adminWaitlistHead">
        <div>
          <span className="eyebrow">SPILL Admin</span>
          <h1>Events</h1>
          <p>Everything on What’s On — events, SPILL 42 nights and livestreams. Times are in each venue’s local time.</p>
        </div>
        <nav className="adminLinks">
          <Link href="/admin">← Active tables</Link>
          <Link href="/admin/waitlist">Waitlist</Link>
        </nav>
      </header>

      {!password ? (
        <AdminSignIn onSignIn={setPassword} error={error} />
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
            <strong>{events ? `${events.length} event${events.length === 1 ? "" : "s"}` : "Loading…"}</strong>
            <button
              className="button primary"
              type="button"
              onClick={() => {
                setFormError("");
                setEditing({ id: null, form: { ...EMPTY_FORM, locationSlug: location || "saigon" } });
              }}
            >
              + New event
            </button>
          </div>
          {error && <p className="formStatus waitlistStatus error">{error}</p>}

          {editing && (
            <form className="inquiryForm eventEditor" onSubmit={save}>
              <div className="eventEditorHead">
                <p className="eyebrow">{editing.id ? "Edit event" : "New event"}</p>
                <button className="adminLinkBtn" type="button" onClick={() => setEditing(null)} aria-label="Close without saving">
                  ✕ Close
                </button>
              </div>

              <fieldset className="editorSection">
                <legend>The basics</legend>
                <div className="formPair">
                  <label>
                    <span className="fieldLabel">Location</span>
                    <select value={editing.form.locationSlug} onChange={(e) => set("locationSlug", e.target.value)}>
                      {locations.map((l) => (
                        <option key={l.slug} value={l.slug}>
                          {l.name}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    <span className="fieldLabel">Type</span>
                    <select value={editing.form.category} onChange={(e) => set("category", e.target.value as EventCategoryKey)}>
                      {EVENT_CATEGORIES.map((c) => (
                        <option key={c} value={c}>
                          {CATEGORY_META[c].label}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
                <label>
                  <span className="fieldLabel">Title</span>
                  <input value={editing.form.title} onChange={(e) => set("title", e.target.value)} required maxLength={120} placeholder="Founder Night" />
                </label>
                <label>
                  <span className="fieldLabel">
                    Summary <small>One or two lines — shown on cards and link previews</small>
                  </span>
                  <input value={editing.form.summary} onChange={(e) => set("summary", e.target.value)} required maxLength={240} />
                </label>
                <label>
                  <span className="fieldLabel">
                    Description <small>Optional · leave a blank line between paragraphs</small>
                  </span>
                  <textarea rows={4} value={editing.form.description} onChange={(e) => set("description", e.target.value)} maxLength={5000} />
                </label>
              </fieldset>

              <fieldset className="editorSection">
                <legend>When · {getLocation(editing.form.locationSlug)?.city ?? ""} time</legend>
                <div className="formPair">
                  <label>
                    <span className="fieldLabel">Starts</span>
                    <input type="datetime-local" value={editing.form.startsAt} onChange={(e) => set("startsAt", e.target.value)} required />
                  </label>
                  <label>
                    <span className="fieldLabel">
                      Ends <small>Optional</small>
                    </span>
                    <input type="datetime-local" value={editing.form.endsAt} onChange={(e) => set("endsAt", e.target.value)} />
                  </label>
                </div>
              </fieldset>

              <fieldset className="editorSection">
                <legend>Image & links</legend>
                <div className="editorImageRow">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={eventImage(editing.form)} alt="" />
                  <label>
                    <span className="fieldLabel">
                      Image{" "}
                      <small>
                        Optional · empty = {youtubeId(editing.form.youtubeUrl) ? "YouTube thumbnail" : `default ${CATEGORY_META[editing.form.category].label} image`}
                      </small>
                    </span>
                    <input value={editing.form.imageUrl} onChange={(e) => set("imageUrl", e.target.value)} placeholder="https://… or /assets/…" />
                  </label>
                </div>
                <div className="formPair">
                  <label>
                    <span className="fieldLabel">
                      Ticket / booking link <small>Optional</small>
                    </span>
                    <input value={editing.form.ticketUrl} onChange={(e) => set("ticketUrl", e.target.value)} placeholder="https://…" />
                  </label>
                  <label>
                    <span className="fieldLabel">
                      YouTube link <small>For livestreams</small>
                    </span>
                    <input value={editing.form.youtubeUrl} onChange={(e) => set("youtubeUrl", e.target.value)} placeholder="https://youtu.be/… or youtube.com/live/…" />
                  </label>
                </div>
                <label>
                  <span className="fieldLabel">
                    Page link <small>Optional · made from the title if empty</small>
                  </span>
                  <span className="slugField">
                    <span>/{editing.form.locationSlug}/whats-on/</span>
                    <input value={editing.form.slug} onChange={(e) => set("slug", e.target.value)} placeholder="founder-night" />
                  </span>
                </label>
              </fieldset>

              <fieldset className="editorSection">
                <legend>On the website</legend>
                <div className="visibilityChoice" role="radiogroup" aria-label="Visibility">
                  <label className={!editing.form.published ? "on" : undefined}>
                    <input type="radio" name="visibility" checked={!editing.form.published} onChange={() => set("published", false)} />
                    <span>
                      <b>Draft</b>
                      <small>Hidden — only staff can see it here</small>
                    </span>
                  </label>
                  <label className={editing.form.published ? "on" : undefined}>
                    <input type="radio" name="visibility" checked={editing.form.published} onChange={() => set("published", true)} />
                    <span>
                      <b>Published</b>
                      <small>Visible on What’s On straight away</small>
                    </span>
                  </label>
                </div>
                <div className="eventToggles">
                  <label>
                    <input type="checkbox" checked={editing.form.rsvpEnabled} onChange={(e) => set("rsvpEnabled", e.target.checked)} />
                    <span>Guests can RSVP (“I’m coming”)</span>
                  </label>
                  <label>
                    <input type="checkbox" checked={editing.form.featured} onChange={(e) => set("featured", e.target.checked)} />
                    <span>★ Feature on the global homepage</span>
                  </label>
                </div>
              </fieldset>

              {formError && <p className="formStatus waitlistStatus error">{formError}</p>}
              <div className="eventEditorActions">
                <button className="button primary" type="submit" disabled={saving}>
                  {saving ? "Saving…" : editing.form.published ? "Save & publish" : "Save as draft"}
                </button>
                <button className="button secondary" type="button" onClick={() => setEditing(null)}>
                  Cancel
                </button>
              </div>
            </form>
          )}

          {events && events.length === 0 && !editing && (
            <p className="adminWaitlistEmpty">No events yet. Add the first one with “+ New event”.</p>
          )}
          {events && events.length > 0 && (
            <div className="adminWaitlistTableWrap">
              <table className="adminWaitlistTable adminEventsTable">
                <thead>
                  <tr>
                    <th>When</th>
                    <th>Event</th>
                    <th>Status</th>
                    <th>RSVPs</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {events.map((e) => {
                    const tz = tzOf(e.locationSlug);
                    return (
                      <Fragment key={e.id}>
                        <tr className={e.past ? "isPast" : undefined}>
                          <td data-label="When">
                            {formatEventWhen({ startsAt: new Date(e.startsAt), endsAt: e.endsAt ? new Date(e.endsAt) : null }, tz)}
                            <small>{getLocation(e.locationSlug)?.name}</small>
                          </td>
                          <td className="adminEventCell">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={eventImage(e)} alt="" width={64} height={40} />
                            <div>
                              {e.published ? (
                                <a href={`/${e.locationSlug}/whats-on/${e.slug}`} target="_blank" rel="noreferrer">
                                  {e.title} ↗
                                </a>
                              ) : (
                                <b>{e.title}</b>
                              )}
                              <small>{CATEGORY_META[e.category].label}</small>
                            </div>
                          </td>
                          <td data-label="Status">
                            <button type="button" className={`adminPill ${e.published ? "on" : "draft"}`} onClick={() => toggle(e, "published")} title={e.published ? "Click to hide (back to draft)" : "Click to publish"}>
                              {e.published ? "● Published" : "Draft · hidden"}
                            </button>
                            <button type="button" className={`adminPill ${e.featured ? "on" : ""}`} onClick={() => toggle(e, "featured")}>
                              {e.featured ? "★ Featured" : "☆ Feature"}
                            </button>
                          </td>
                          <td data-label="RSVPs">
                            {e.rsvpEnabled ? (
                              e.rsvps ? (
                                <button type="button" className="adminLinkBtn" onClick={() => showGuests(e)}>
                                  {e.rsvps} sign-up{e.rsvps === 1 ? "" : "s"} · {e.people} {e.people === 1 ? "person" : "people"}
                                </button>
                              ) : (
                                "0"
                              )
                            ) : (
                              "Off"
                            )}
                          </td>
                          <td className="adminActionsCell">
                            <div className="adminRowActions">
                            <button type="button" className="adminLinkBtn" onClick={() => { setFormError(""); setEditing({ id: e.id, form: toForm(e) }); window.scrollTo({ top: 0, behavior: "smooth" }); }}>
                              Edit
                            </button>
                            {e.rsvps > 0 && (
                              <button type="button" className="adminLinkBtn" onClick={() => downloadGuests(e)}>
                                CSV
                              </button>
                            )}
                            <button type="button" className="adminLinkBtn danger" onClick={() => remove(e)}>
                              Delete
                            </button>
                            </div>
                          </td>
                        </tr>
                        {guestList?.eventId === e.id && (
                          <tr className="adminGuestRow">
                            <td colSpan={5}>
                              <ul>
                                {guestList.rsvps.map((r) => (
                                  <li key={r.id}>
                                    <b>{r.name}</b> · {r.partySize} · <a href={`mailto:${r.email}`}>{r.email}</a>
                                    {r.whatsapp ? ` · ${r.whatsapp}` : ""}
                                    {new Date(r.updatedAt).getTime() - new Date(r.createdAt).getTime() > 60_000 && (
                                      <small className="adminUpdated"> ↻ updated</small>
                                    )}
                                  </li>
                                ))}
                              </ul>
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </main>
  );
}

