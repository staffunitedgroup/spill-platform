"use client";

import { useState, type FormEvent } from "react";
import { submitInquiry } from "@/lib/submit-inquiry";

export function MailInquiryForm({ formTitle, interests, subject = "SPILL website enquiry", investor = false }: { formTitle: string; interests: string[]; subject?: string; investor?: boolean }) {
  const [status, setStatus] = useState("");
  const [sending, setSending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const labels: Record<string, string> = {
      interest: "Interested in", name: "Name", company: "Company", email: "Email", phone: "Phone", city: "City", country: "Country", experience: "Relevant experience", investment: "Estimated investment range", property: "Property available", message: "Message",
    };
    const fields = Object.fromEntries(Array.from(data.entries()).filter(([key, value]) => key !== "website" && String(value).trim()).map(([key, value]) => [labels[key] ?? key, String(value).trim()]));
    setSending(true);
    setStatus("Sending your enquiry…");
    try {
      await submitInquiry({ subject, fields, website: String(data.get("website") ?? "") });
      form.reset();
      setStatus("Thank you. Your enquiry has been sent to the SPILL team.");
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
