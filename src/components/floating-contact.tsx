"use client";

// SPILL live chat (the red button, bottom right, on every page).
// A short guided chat — topic → message → name → email — that lands in
// Admin → Requests (type "Contact") and emails the team, like the forms.
// Nobody has to be online: the visitor leaves an email and the team replies.
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { submitInquiry } from "@/lib/submit-inquiry";

const TOPICS: { label: string; reply: string; link?: { href: string; label: string } }[] = [
  { label: "Visiting SPILL Saigon", reply: "Lovely — we’re opening soon. What would you like to know?" },
  { label: "Events + SPILL 42", reply: "Nice. Ask us anything about events, nights or SPILL 42." },
  { label: "Podcast · Livestream · Confessional", reply: "Great. Tell us what you’d like to make or book.", link: { href: "/create", label: "See all the ways to create" } },
  { label: "Private event", reply: "We’d love to host you. Tell us about your event — date, group size, idea.", link: { href: "/saigon/private-events", label: "Or use the full event form" } },
  { label: "Partnership or sponsorship", reply: "Good to hear from you. What do you have in mind?", link: { href: "/partner", label: "See partnership options" } },
  { label: "Investing", reply: "Thanks for your interest. Tell us a little about yourself.", link: { href: "/partner/investors", label: "Or use the investor form" } },
  { label: "Something else", reply: "Sure — what’s on your mind?" },
];

type Step = "topic" | "message" | "name" | "email" | "sending" | "done";
type Line = { from: "spill" | "you"; text: string; link?: { href: string; label: string } };

const GREETING: Line[] = [
  { from: "spill", text: "Hi, welcome to SPILL." },
  { from: "spill", text: "What brings you here today?" },
];

export function FloatingContact({ phone }: { phone?: string }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>("topic");
  const [lines, setLines] = useState<Line[]>(GREETING);
  const [topic, setTopic] = useState("");
  const [message, setMessage] = useState("");
  const [name, setName] = useState("");
  const [draft, setDraft] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [error, setError] = useState("");
  const scroller = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement & HTMLTextAreaElement>(null);

  // Other parts of the site can open the chat: a link to "#chat", or
  // window.dispatchEvent(new Event("spill:open-chat")).
  useEffect(() => {
    const openChat = () => setOpen(true);
    const onHash = () => { if (window.location.hash === "#chat") openChat(); };
    const onClick = (event: MouseEvent) => {
      const link = (event.target as HTMLElement).closest?.('a[href="#chat"]');
      if (link) { event.preventDefault(); openChat(); }
    };
    window.addEventListener("spill:open-chat", openChat);
    window.addEventListener("hashchange", onHash);
    document.addEventListener("click", onClick);
    onHash();
    return () => {
      window.removeEventListener("spill:open-chat", openChat);
      window.removeEventListener("hashchange", onHash);
      document.removeEventListener("click", onClick);
    };
  }, []);

  // Keep the newest message in view and the cursor in the box.
  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: "smooth" });
    if (open && (step === "message" || step === "name" || step === "email")) input.current?.focus();
  }, [lines, step, open]);

  function say(...next: Line[]) {
    setLines((current) => [...current, ...next]);
  }

  function chooseTopic(choice: (typeof TOPICS)[number]) {
    setTopic(choice.label);
    say({ from: "you", text: choice.label }, { from: "spill", text: choice.reply, link: choice.link });
    setStep("message");
  }

  async function send(email: string) {
    setStep("sending");
    setError("");
    try {
      const result = await submitInquiry({
        kind: "CONTACT",
        name,
        email,
        summary: `Live chat · ${topic}`,
        fields: [
          { label: "Topic", value: topic },
          { label: "Message", value: message },
          { label: "Sent from page", value: pathname || "/" },
        ],
        website: honeypot,
      });
      say({
        from: "spill",
        text: result.emailed === false
          ? `Thanks, ${name.split(" ")[0]}! The SPILL team has your message and will reply to ${email}.`
          : `Thanks, ${name.split(" ")[0]}! The SPILL team has your message and will reply to ${email} — check your inbox for a confirmation.`,
      });
      setStep("done");
    } catch (problem) {
      setError(problem instanceof Error ? problem.message : "That didn’t send. Please try again.");
      setStep("email");
    }
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    const value = draft.trim();
    if (!value) return;
    if (step === "message") {
      setMessage(value);
      say({ from: "you", text: value }, { from: "spill", text: "Thanks! What’s your name?" });
      setStep("name");
    } else if (step === "name") {
      setName(value);
      say({ from: "you", text: value }, { from: "spill", text: `Nice to meet you, ${value.split(" ")[0]}. Leave your email and the SPILL team will get back to you.` });
      setStep("email");
    } else if (step === "email") {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        setError("Please enter a valid email.");
        return;
      }
      say({ from: "you", text: value });
      void send(value);
    }
    setDraft("");
  }

  function restart() {
    setLines(GREETING);
    setStep("topic");
    setTopic("");
    setMessage("");
    setName("");
    setDraft("");
    setError("");
  }

  const placeholder = step === "message" ? "Type your message…" : step === "name" ? "Your name" : "you@example.com";

  return <div className={`floatingContact ${open ? "open" : ""}`}>
    {open && <section className="floatingContactPanel spillChat" aria-label="Chat with SPILL">
      <header className="spillChatHead">
        <div>
          <p className="eyebrow">Chat with SPILL</p>
          <small>We usually reply within a day.</small>
        </div>
        <button className="floatingContactClose" type="button" onClick={() => setOpen(false)} aria-label="Close chat">×</button>
      </header>

      <div className="spillChatLog" ref={scroller} aria-live="polite">
        {lines.map((line, index) => <div key={index} className={`spillChatLine ${line.from}`}>
          <p>{line.text}</p>
          {line.link && <Link href={line.link.href} onClick={() => setOpen(false)}>{line.link.label} →</Link>}
        </div>)}
        {step === "sending" && <div className="spillChatLine spill typing" aria-label="Sending"><p><i /><i /><i /></p></div>}
        {step === "topic" && <div className="spillChatChoices">
          {TOPICS.map((choice) => <button key={choice.label} type="button" onClick={() => chooseTopic(choice)}>{choice.label}</button>)}
        </div>}
      </div>

      {(step === "message" || step === "name" || step === "email" || step === "sending") && <form className="spillChatInput" onSubmit={submit}>
        {step === "message"
          ? <textarea ref={input} rows={2} value={draft} maxLength={2000} placeholder={placeholder} aria-label="Your message"
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); submit(event); } }} />
          : <input ref={input} value={draft} placeholder={placeholder} disabled={step === "sending"}
              type={step === "email" ? "email" : "text"} autoComplete={step === "email" ? "email" : "name"} maxLength={step === "email" ? 200 : 120}
              aria-label={step === "email" ? "Your email" : "Your name"}
              onChange={(event) => { setDraft(event.target.value); setError(""); }} />}
        <label className="formHoneypot" aria-hidden="true">Website<input tabIndex={-1} autoComplete="off" value={honeypot} onChange={(event) => setHoneypot(event.target.value)} /></label>
        <button type="submit" disabled={step === "sending" || !draft.trim()} aria-label="Send">→</button>
      </form>}
      {error && <p className="spillChatError" role="alert">{error}</p>}

      <footer className="spillChatFoot">
        {step === "done"
          ? <button type="button" onClick={restart}>Start a new chat</button>
          : <a href="mailto:spill@nowwespill.com">spill@nowwespill.com</a>}
        {phone && <a href={`tel:${phone.replace(/[^+\d]/g, "")}`}>Call {phone}</a>}
      </footer>
    </section>}
    <button className="floatingContactTrigger" type="button" onClick={() => setOpen((current) => !current)} aria-expanded={open} aria-label={open ? "Close chat" : "Chat with SPILL"}><Image src="/assets/spill/ui/contact-arrow.png" alt="" width={128} height={128} aria-hidden="true" /></button>
  </div>;
}
