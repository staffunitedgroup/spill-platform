"use client";

import Image from "next/image";
import { useState, type FormEvent } from "react";
import { submitInquiry } from "@/lib/submit-inquiry";

export function FloatingContact({ phone }: { phone?: string }) {
  const [open, setOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    setSending(true);
    setStatus("Sending…");
    try {
      await submitInquiry({ subject: "SPILL quick contact", fields: { Name: String(data.get("name") ?? ""), Email: String(data.get("email") ?? ""), Message: String(data.get("message") ?? "") }, website: String(data.get("website") ?? "") });
      form.reset();
      setStatus("Sent. The SPILL team will be in touch.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Unable to send. Please try again.");
    } finally {
      setSending(false);
    }
  }

  return <div className={`floatingContact ${open ? "open" : ""}`}>
    {open && <section className="floatingContactPanel" aria-label="Contact SPILL"><button className="floatingContactClose" type="button" onClick={() => setOpen(false)} aria-label="Close contact form">×</button><p className="eyebrow">Contact SPILL</p><h2>Start a conversation.</h2><a href="mailto:hello@spillcafebar.com">hello@spillcafebar.com</a>{phone && <a href={`tel:${phone.replace(/[^+\d]/g, "")}`}>Call {phone}</a>}<form onSubmit={handleSubmit}><label>Name<input name="name" autoComplete="name" required /></label><label>Email<input name="email" type="email" autoComplete="email" required /></label><label>Message<textarea name="message" rows={3} required /></label><label className="formHoneypot" aria-hidden="true">Website<input name="website" tabIndex={-1} autoComplete="off" /></label><button type="submit" disabled={sending}>{sending ? "Sending…" : "Send message"}<span>→</span></button><p aria-live="polite">{status}</p></form></section>}
    <button className="floatingContactTrigger" type="button" onClick={() => setOpen((current) => !current)} aria-expanded={open} aria-label={open ? "Close contact form" : "Contact SPILL"}><Image src="/assets/spill/ui/contact-arrow.png" alt="" width={128} height={128} aria-hidden="true" /></button>
  </div>;
}
