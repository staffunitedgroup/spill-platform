"use client";

import { useState, type FormEvent } from "react";
import type { RequestKindKey } from "@/lib/booking-meta";
import { submitInquiry } from "@/lib/submit-inquiry";

export function MailInquiryForm({ formTitle, interests, kind, investor = false }: { formTitle: string; interests: string[]; kind: RequestKindKey; investor?: boolean }) {
  const [status, setStatus] = useState("");
  const [sending, setSending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const labels: Record<string, string> = {
      interest: "Interested in", name: "Name", company: "Company", email: "Email", phone: "Phone", city: "City", country: "Country", experience: "Relevant experience", investment: "Estimated investment range", property: "Property available", message: "Message",
    };
    const text = (key: string) => String(data.get(key) ?? "").trim();
    // Name and email have their own columns; everything else goes in order.
    const fields = Array.from(data.keys())
      .filter((key) => !["website", "name", "email"].includes(key))
      .map((key) => ({ label: labels[key] ?? key, value: text(key) }))
      .filter((field) => field.value);
    const place = [text("city"), text("country")].filter(Boolean).join(", ");
    const summary = [text("interest"), text("company"), place].filter(Boolean).join(" · ").slice(0, 200);
    setSending(true);
    setStatus("Sending your enquiry…");
    try {
      const result = await submitInquiry({ kind, name: text("name"), email: text("email"), summary, fields, website: text("website") });
      form.reset();
      setStatus(result.emailed === false ? "Thank you. Your enquiry is with the SPILL team — we'll be in touch soon." : "Thank you. Your enquiry is with the SPILL team — check your inbox for a confirmation.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Your enquiry could not be sent. Please try again.");
    } finally {
      setSending(false);
    }
  }

  return <form className="inquiryForm" onSubmit={handleSubmit}><p className="eyebrow">{formTitle}</p>
    <label>I am interested in<select name="interest" defaultValue="" required><option value="" disabled>Select an option</option>{interests.map((interest) => <option key={interest}>{interest}</option>)}</select></label>
    <div className="formPair"><label>Name<input name="name" autoComplete="name" required /></label><label>Company<input name="company" autoComplete="organization" /></label></div>
    <div className="formPair"><label>Email<input name="email" type="email" autoComplete="email" required /></label><label>Phone<input name="phone" type="tel" autoComplete="tel" /></label></div>
    <div className="formPair"><label>City<input name="city" autoComplete="address-level2" /></label><label>Country<input name="country" autoComplete="country-name" /></label></div>
    <label>Relevant experience<textarea name="experience" rows={3} /></label>
    {investor && <div className="formPair"><label>Estimated investment range<input name="investment" /></label><label>Property available?<select name="property" defaultValue=""><option value="" disabled>Select</option><option>Yes</option><option>No</option><option>Exploring</option></select></label></div>}
    <label className="formHoneypot" aria-hidden="true">Website<input name="website" tabIndex={-1} autoComplete="off" /></label>
    <label>Message<textarea name="message" rows={5} required /></label><button className="button primary" type="submit" disabled={sending}>{sending ? "Sending…" : "Start a conversation"} <span>↗</span></button>
    <p className="formStatus" aria-live="polite">{status || "Your enquiry will be sent directly to the SPILL team."}</p>
  </form>;
}
