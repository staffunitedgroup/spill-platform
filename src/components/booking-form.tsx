"use client";

import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { PhoneInput } from "@/components/phone-input";
import { CONFESSIONAL_PACKAGES, type RequestField } from "@/lib/booking-meta";

type Kind = "LIVESTREAM" | "CONFESSIONAL";

type Sent = { emailed: boolean; email: string };

/** "Work with SPILL" request form for the Livestream and Confessional pages. */
export function BookingForm({ kind }: { kind: Kind }) {
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState<Sent | null>(null);
  const [error, setError] = useState("");
  const [pkg, setPkg] = useState<string>(CONFESSIONAL_PACKAGES[0].name);
  const boxRef = useRef<HTMLElement | null>(null);
  const firstRender = useRef(true);

  // The form is much taller than the "thank you" box. When one swaps for the other,
  // re-measure the page's scroll animations (otherwise sections further down stay
  // hidden and the screen looks blank) and bring the message into view.
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    const frame = requestAnimationFrame(() => {
      ScrollTrigger.refresh();
      boxRef.current?.scrollIntoView({ block: "center" });
    });
    return () => cancelAnimationFrame(frame);
  }, [sent]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const get = (key: string) => String(data.get(key) ?? "").trim();
    const { summary, fields } = kind === "LIVESTREAM" ? livestreamAnswers(get) : confessionalAnswers(get);

    setSending(true);
    setError("");
    try {
      const response = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind,
          name: get("name"),
          email: get("email"),
          whatsapp: get("whatsapp"),
          whatsappCountry: get("whatsappCountry"),
          summary,
          fields,
          website: get("website"),
        }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || "We couldn't send that. Please try again.");
      setSent({ emailed: Boolean(result.emailed), email: get("email") });
    } catch (err) {
      setError(err instanceof Error ? err.message : "We couldn't send that. Please try again.");
    } finally {
      setSending(false);
    }
  }

  if (sent) {
    return (
      <div className="inquiryForm bookingForm rsvpDone" role="status" ref={(el) => void (boxRef.current = el)}>
        <p className="eyebrow">Request sent</p>
        <h3>Thank you — we’ve got it.</h3>
        <p>
          The SPILL team will get back to you soon, usually within 2 working days.
          {sent.emailed ? ` A copy is on its way to ${sent.email}.` : ""}
        </p>
        <button type="button" className="button secondary" onClick={() => setSent(null)}>
          Send another request
        </button>
      </div>
    );
  }

  return (
    <form className="inquiryForm bookingForm" onSubmit={handleSubmit} id="book" ref={(el) => void (boxRef.current = el)}>
      <p className="eyebrow">{kind === "LIVESTREAM" ? "Book your appearance" : "Book a Confessional"}</p>
      <div className="formPair">
        <label>
          Name
          <input name="name" autoComplete="name" required maxLength={120} />
        </label>
        <label>
          Email
          <input name="email" type="email" autoComplete="email" required maxLength={200} />
        </label>
      </div>
      <PhoneInput name="whatsapp" label="WhatsApp" optional />

      {kind === "LIVESTREAM" ? (
        <>
          <div className="formPair">
            <Select name="who" label="I am a…" options={["Individual", "Creator", "Founder", "Business", "Performer", "Other"]} />
            <Select
              name="format"
              label="What kind of appearance?"
              options={["Conversation or interview", "Performance", "Launch or announcement", "Q&A with the audience", "Not sure yet"]}
            />
          </div>
          <label>
            What would you like to share?
            <textarea name="idea" rows={4} required maxLength={2000} placeholder="Your story, idea, talent or business — in a few lines." />
          </label>
          <div className="formPair">
            <label>
              <span>
                Preferred dates <small>Optional</small>
              </span>
              <input name="dates" maxLength={200} placeholder="e.g. weekday evenings, late October" />
            </label>
            <label>
              <span>
                Links <small>Optional</small>
              </span>
              <input name="links" maxLength={500} placeholder="Instagram, TikTok, website…" />
            </label>
          </div>
        </>
      ) : (
        <>
          <fieldset className="waitlistInterests bookingPackages">
            <legend>Package</legend>
            {CONFESSIONAL_PACKAGES.map((p) => (
              <label key={p.name}>
                <input type="radio" name="package" value={p.name} checked={pkg === p.name} onChange={() => setPkg(p.name)} />
                <span>
                  {p.name} <b>{p.price}</b>
                </span>
              </label>
            ))}
          </fieldset>
          <div className="formPair">
            <label>
              Preferred date
              <input name="date" type="date" required min={today()} />
            </label>
            <Select name="time" label="Time of day" options={["Morning", "Afternoon", "Evening", "Late night"]} />
          </div>
          <div className="formPair">
            <Select
              key={pkg}
              name="people"
              label="How many people?"
              options={pkg.startsWith("Two-Person") ? ["2 people"] : ["1 person", "2 people"]}
            />
            <Select
              name="recording"
              label="Your recording"
              options={["Private — only for me", "Shareable — ready for me to post", "SPILL may publish it", "Anonymous", "Not sure yet"]}
            />
          </div>
          <label>
            <span>
              Anything else? <small>Optional</small>
            </span>
            <textarea name="notes" rows={3} maxLength={2000} placeholder="Occasion, accessibility needs, questions…" />
          </label>
          <p className="bookingNote">SPILL Saigon is opening soon — we’ll confirm your date and the final price with you.</p>
        </>
      )}

      <label className="formHoneypot" aria-hidden="true">
        Website
        <input name="website" tabIndex={-1} autoComplete="off" />
      </label>
      <button className="button primary" type="submit" disabled={sending}>
        {sending ? "Sending…" : "Send request"} <span>→</span>
      </button>
      {error && (
        <p className="formStatus waitlistStatus error" role="alert">
          {error}
        </p>
      )}
    </form>
  );
}

function Select({ name, label, options }: { name: string; label: ReactNode; options: string[] }) {
  return (
    <label>
      {label}
      <select name={name} defaultValue={options[0]}>
        {options.map((o) => (
          <option key={o}>{o}</option>
        ))}
      </select>
    </label>
  );
}

function today() {
  const d = new Date();
  return new Date(d.getTime() - d.getTimezoneOffset() * 60_000).toISOString().slice(0, 10);
}

function prettyDate(iso: string) {
  if (!iso) return "";
  return new Intl.DateTimeFormat("en-GB", { weekday: "short", day: "numeric", month: "short", timeZone: "UTC" }).format(new Date(`${iso}T00:00:00Z`));
}

function livestreamAnswers(get: (key: string) => string): { summary: string; fields: RequestField[] } {
  return {
    summary: `${get("format")} · ${get("who")}`,
    fields: [
      { label: "I am a", value: get("who") },
      { label: "Appearance", value: get("format") },
      { label: "What they'd like to share", value: get("idea") },
      { label: "Preferred dates", value: get("dates") },
      { label: "Links", value: get("links") },
    ],
  };
}

function confessionalAnswers(get: (key: string) => string): { summary: string; fields: RequestField[] } {
  const when = [prettyDate(get("date")), get("time").toLowerCase()].filter(Boolean).join(", ");
  return {
    summary: `${get("package")} · ${when} · ${get("people")}`,
    fields: [
      { label: "Package", value: get("package") },
      { label: "Preferred date", value: prettyDate(get("date")) },
      { label: "Time of day", value: get("time") },
      { label: "People", value: get("people") },
      { label: "Recording", value: get("recording") },
      { label: "Notes", value: get("notes") },
    ],
  };
}
