"use client";

import { FormEvent, useState } from "react";
import { submitInquiry } from "@/lib/submit-inquiry";

export function PodcastInquiryForm() {
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const fields = {
      Name: String(data.get("name") ?? ""), Email: String(data.get("email") ?? ""), "Phone / WhatsApp": String(data.get("phone") || "Not supplied"), Location: String(data.get("location") ?? ""), "Project type": String(data.get("projectType") ?? ""), "Existing podcast": String(data.get("existingPodcast") ?? ""), Format: String(data.get("format") ?? ""), "Editing required": String(data.get("editing") ?? ""), "Short-form content": String(data.get("shortForm") ?? ""), "Recording frequency": String(data.get("frequency") ?? ""), "Audience recording": String(data.get("audience") ?? ""), "Sponsorship interest": String(data.get("sponsorship") ?? ""), "Idea / show": String(data.get("idea") ?? ""), "Additional information": String(data.get("additional") ?? ""),
    };
    setSending(true);
    setMessage("Sending your production brief…");
    try {
      await submitInquiry({ subject: `SPILL Podcast inquiry — ${fields.Name}`, fields });
      form.reset();
      setMessage("Thank you. Your podcast enquiry has been sent to the SPILL team.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Your enquiry could not be sent. Please try again.");
    } finally {
      setSending(false);
    }
  }

  return <form className="podInquiryForm" onSubmit={handleSubmit}>
    <div className="podFormGrid">
      <label><span>Name *</span><input name="name" autoComplete="name" required /></label>
      <label><span>Email *</span><input name="email" type="email" autoComplete="email" required /></label>
      <label><span>Phone / WhatsApp</span><input name="phone" type="tel" autoComplete="tel" /></label>
      <label><span>Location</span><select name="location" defaultValue="Saigon"><option>Saigon</option><option>Tokyo</option><option>Other</option></select></label>
      <label><span>I am a...</span><select name="projectType" defaultValue="Creator"><option>Individual</option><option>Creator</option><option>Business</option><option>Brand</option><option>Organization</option></select></label>
      <label><span>Do you already have a podcast?</span><select name="existingPodcast" defaultValue="No — I have an idea"><option>No — I have an idea</option><option>Yes — it is active</option><option>Yes — currently paused</option></select></label>
      <label><span>Format</span><select name="format" defaultValue="Both"><option>Video</option><option>Audio</option><option>Both</option></select></label>
      <label><span>Editing required?</span><select name="editing" defaultValue="Yes"><option>Yes</option><option>No — recording only</option><option>Not sure yet</option></select></label>
      <label><span>Short-form content required?</span><select name="shortForm" defaultValue="Yes"><option>Yes</option><option>No</option><option>Not sure yet</option></select></label>
      <label><span>Expected recording frequency</span><select name="frequency" defaultValue="Monthly"><option>One-off episode</option><option>Weekly</option><option>Biweekly</option><option>Monthly</option><option>Seasonal / batch</option><option>Not sure yet</option></select></label>
      <label><span>Interested in audience recording?</span><select name="audience" defaultValue="Maybe"><option>Yes</option><option>No</option><option>Maybe</option></select></label>
      <label><span>Sponsorship / brand partnerships?</span><select name="sponsorship" defaultValue="Maybe"><option>Yes</option><option>No</option><option>Maybe</option></select></label>
    </div>
    <label className="podFormWide"><span>Tell us about your idea or show *</span><textarea name="idea" rows={5} required /></label>
    <label className="podFormWide"><span>Additional information</span><textarea name="additional" rows={3} /></label>
    <div className="podFormSubmit"><button className="button primary" type="submit" disabled={sending}>{sending ? "Sending…" : "Start the conversation"} <span>↗</span></button><p aria-live="polite">{message || "Your production brief will be sent directly to the SPILL team."}</p></div>
  </form>;
}
