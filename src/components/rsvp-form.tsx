"use client";

import { useState, type FormEvent } from "react";
import { PhoneInput } from "@/components/phone-input";

export function RsvpForm({ eventId, eventTitle }: { eventId: string; eventTitle: string }) {
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState<{ updated: boolean; emailed: boolean; email: string; partySize: number } | null>(null);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setSending(true);
    setError("");
    try {
      const response = await fetch(`/api/events/${eventId}/rsvp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: String(data.get("name") ?? ""),
          email: String(data.get("email") ?? ""),
          whatsapp: String(data.get("whatsapp") ?? ""),
          whatsappCountry: String(data.get("whatsappCountry") ?? ""),
          partySize: Number(data.get("partySize") ?? 1),
          website: String(data.get("website") ?? ""),
        }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || "We couldn't save that. Please try again.");
      setDone({
        updated: Boolean(result.updated),
        emailed: Boolean(result.emailed),
        email: String(data.get("email") ?? ""),
        partySize: Number(data.get("partySize") ?? 1),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "We couldn't save that. Please try again.");
    } finally {
      setSending(false);
    }
  }

  if (done) {
    return (
      <div className="inquiryForm rsvpForm rsvpDone" role="status">
        <p className="eyebrow">{done.updated ? "Already on the list" : "You’re on the list"}</p>
        <h3>See you at {eventTitle}.</h3>
        <p>
          {done.updated
            ? `You’d already signed up with this email, so we’ve updated your details (${done.partySize} ${done.partySize === 1 ? "person" : "people"}).`
            : "Your spot is saved."}{" "}
          {done.emailed ? `A confirmation is on its way to ${done.email}.` : ""}
        </p>
        <p>Plans changed? Sign up again with the same email to update it.</p>
      </div>
    );
  }

  return (
    <form className="inquiryForm rsvpForm" onSubmit={handleSubmit} id="rsvp">
      <p className="eyebrow">I’m coming</p>
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
      <div className="formPair rsvpPair">
        <PhoneInput name="whatsapp" label="WhatsApp" optional />
        <label>
          How many people?
          <select name="partySize" defaultValue="1">
            {Array.from({ length: 10 }, (_, i) => (
              <option key={i + 1} value={i + 1}>
                {i + 1}
                {i === 0 ? " (just me)" : ""}
              </option>
            ))}
          </select>
        </label>
      </div>
      <label className="formHoneypot" aria-hidden="true">
        Website
        <input name="website" tabIndex={-1} autoComplete="off" />
      </label>
      <button className="button primary" type="submit" disabled={sending}>
        {sending ? "Saving…" : "Save my spot"} <span>→</span>
      </button>
      <p className={`formStatus waitlistStatus ${error ? "error" : ""}`} aria-live="polite">
        {error || "Free. We’ll also add you to the SPILL list for news about future nights."}
      </p>
    </form>
  );
}
