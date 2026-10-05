"use client";

import { useState, type FormEvent } from "react";
import { WAITLIST_INTERESTS } from "@/lib/validation/waitlist";

type Status = { tone: "idle" | "ok" | "error"; text: string };

export function WaitlistForm({
  locationSlug,
  locationName,
  source,
  cta = "Join the waitlist",
}: {
  locationSlug: string;
  locationName: string;
  source: string;
  cta?: string;
}) {
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const [status, setStatus] = useState<Status>({
    tone: "idle",
    text: `Opening news, first events and early booking access for ${locationName}. No spam.`,
  });

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    setSending(true);
    setStatus({ tone: "idle", text: "Adding you to the list…" });
    try {
      const response = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: String(data.get("email") ?? ""),
          name: String(data.get("name") ?? ""),
          whatsapp: String(data.get("whatsapp") ?? ""),
          interests: data.getAll("interests").map(String),
          locationSlug,
          source,
          website: String(data.get("website") ?? ""),
        }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || "We couldn't add you just now. Please try again.");
      form.reset();
      setDone(true);
      setStatus({ tone: "ok", text: `You're on the list. We'll be in touch before ${locationName} opens.` });
    } catch (error) {
      setStatus({
        tone: "error",
        text: error instanceof Error ? error.message : "We couldn't add you just now. Please try again.",
      });
    } finally {
      setSending(false);
    }
  }

  return (
    <form className="inquiryForm waitlistForm" onSubmit={handleSubmit} id="waitlist" aria-label={`Join the ${locationName} waitlist`}>
      <p className="eyebrow">Join the list</p>
      <div className="formPair">
        <label>
          Name
          <input name="name" autoComplete="name" maxLength={120} />
        </label>
        <label>
          Email
          <input name="email" type="email" autoComplete="email" required maxLength={200} />
        </label>
      </div>
      <label>
        <span>
          WhatsApp <small>(optional)</small>
        </span>
        <input name="whatsapp" type="tel" autoComplete="tel" inputMode="tel" maxLength={40} placeholder="+84" />
      </label>
      <fieldset className="waitlistInterests">
        <legend>Tell me about</legend>
        {WAITLIST_INTERESTS.map((interest) => (
          <label key={interest}>
            <input type="checkbox" name="interests" value={interest} defaultChecked={interest === "Opening news"} />
            <span>{interest}</span>
          </label>
        ))}
      </fieldset>
      <label className="formHoneypot" aria-hidden="true">
        Website
        <input name="website" tabIndex={-1} autoComplete="off" />
      </label>
      <button className="button primary" type="submit" disabled={sending}>
        {sending ? "Adding…" : done ? "Add another" : cta} <span>→</span>
      </button>
      <p className={`formStatus waitlistStatus ${status.tone}`} aria-live="polite">
        {status.text}
      </p>
    </form>
  );
}
