"use client";

import { FormEvent, useState } from "react";

export function PodcastInquiryForm() {
  const [message, setMessage] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const lines = [
      `Name: ${data.get("name")}`,
      `Email: ${data.get("email")}`,
      `Phone / WhatsApp: ${data.get("phone") || "Not supplied"}`,
      `Location: ${data.get("location")}`,
      `Project type: ${data.get("projectType")}`,
      `Existing podcast: ${data.get("existingPodcast")}`,
      `Format: ${data.get("format")}`,
      `Editing required: ${data.get("editing")}`,
      `Short-form content: ${data.get("shortForm")}`,
      `Recording frequency: ${data.get("frequency")}`,
      `Audience recording: ${data.get("audience")}`,
      `Sponsorship interest: ${data.get("sponsorship")}`,
      "",
      "Idea / show:",
      String(data.get("idea") || ""),
      "",
      "Additional information:",
      String(data.get("additional") || ""),
    ];

    const subject = encodeURIComponent(`SPILL Podcast inquiry — ${data.get("name")}`);
    const body = encodeURIComponent(lines.join("\n"));
    setMessage("Your email app is opening with the production brief ready to send.");
    window.location.href = `mailto:hello@spillcafebar.com?subject=${subject}&body=${body}`;
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
    <div className="podFormSubmit"><button className="button primary" type="submit">Start the conversation <span>↗</span></button><p>{message || "Submitting opens a prepared email to the SPILL team."}</p></div>
  </form>;
}
