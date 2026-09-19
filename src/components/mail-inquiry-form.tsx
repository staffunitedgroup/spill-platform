"use client";

import { useState, type FormEvent } from "react";

const recipient = "hello@spillcafebar.com";

export function MailInquiryForm({ formTitle, interests, subject = "SPILL website enquiry", investor = false }: { formTitle: string; interests: string[]; subject?: string; investor?: boolean }) {
  const [status, setStatus] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const labels: Record<string, string> = {
      interest: "Interested in", name: "Name", company: "Company", email: "Email", phone: "Phone", city: "City", country: "Country", experience: "Relevant experience", investment: "Estimated investment range", property: "Property available", message: "Message",
    };
    const body = Array.from(data.entries()).filter(([, value]) => String(value).trim()).map(([key, value]) => `${labels[key] ?? key}: ${String(value).trim()}`).join("\n\n");
    setStatus(`Opening your email app with a message addressed to ${recipient}.`);
    window.location.href = `mailto:${recipient}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }

  return <form className="inquiryForm" onSubmit={handleSubmit}><p className="eyebrow">{formTitle}</p>
    <label>I am interested in<select name="interest" defaultValue="" required><option value="" disabled>Select an option</option>{interests.map((interest) => <option key={interest}>{interest}</option>)}</select></label>
    <div className="formPair"><label>Name<input name="name" autoComplete="name" required /></label><label>Company<input name="company" autoComplete="organization" /></label></div>
    <div className="formPair"><label>Email<input name="email" type="email" autoComplete="email" required /></label><label>Phone<input name="phone" type="tel" autoComplete="tel" /></label></div>
    <div className="formPair"><label>City<input name="city" autoComplete="address-level2" /></label><label>Country<input name="country" autoComplete="country-name" /></label></div>
    <label>Relevant experience<textarea name="experience" rows={3} /></label>
    {investor && <div className="formPair"><label>Estimated investment range<input name="investment" /></label><label>Property available?<select name="property" defaultValue=""><option value="" disabled>Select</option><option>Yes</option><option>No</option><option>Exploring</option></select></label></div>}
    <label>Message<textarea name="message" rows={5} required /></label><button className="button primary" type="submit">Start a conversation <span>↗</span></button>
    <p className="formStatus" aria-live="polite">{status || `Your completed enquiry opens as an email to ${recipient} for you to send.`}</p>
  </form>;
}
