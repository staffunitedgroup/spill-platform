// Confirmation emails for website sign-ups (event RSVPs and the waitlist).
// They go through the same Resend account as the contact form. If email isn't
// set up, sign-ups still work — the guest just doesn't get an email.
import "server-only";
import { formatEventWhen } from "@/lib/event-meta";
import { getLocation } from "@/lib/site-data";
import { emailConfigured, emailHtml, sendEmail } from "@/lib/spill-email";

export { emailConfigured };

const FOOTER = "You're receiving this because you signed up on the SPILL website. Questions? Email hello@spillcafebar.com.";

export async function sendRsvpEmail(input: {
  to: string;
  name: string;
  partySize: number;
  updated: boolean;
  origin: string;
  event: { title: string; slug: string; locationSlug: string; startsAt: Date; endsAt: Date | null };
}) {
  const { event } = input;
  const location = getLocation(event.locationSlug);
  const when = formatEventWhen(event, location?.timezone ?? "Asia/Ho_Chi_Minh");
  const where = location?.name ?? "SPILL";
  const people = `${input.partySize} ${input.partySize === 1 ? "person" : "people"}`;
  const page = `${input.origin}/${event.locationSlug}/whats-on/${event.slug}`;
  const firstName = input.name.trim().split(/\s+/)[0] || "there";

  const heading = input.updated ? `Your RSVP is updated.` : `You're on the list.`;
  const intro = input.updated
    ? `Hi ${firstName}, you'd already signed up for ${event.title}, so we've updated your details.`
    : `Hi ${firstName}, thanks for signing up for ${event.title}.`;
  const body = `${intro}\n\n${when}\n${where}\n${people}\n\nPlans changed? Sign up again on the event page with this email and we'll update it.`;

  return sendEmail({
    to: input.to,
    subject: input.updated ? `Updated: ${event.title}` : `You're on the list: ${event.title}`,
    text: `${heading}\n\n${body}\n\nEvent page: ${page}\nAdd to calendar: ${page}/calendar\n\n${FOOTER}`,
    html: emailHtml({ brand: where.toUpperCase(), heading, body, cta: { label: "Event details", href: page }, footer: FOOTER }),
    tag: "event-rsvp",
  });
}

export async function sendWaitlistEmail(input: {
  to: string;
  name?: string | null;
  locationSlug: string;
  updated: boolean;
  origin: string;
}) {
  const location = getLocation(input.locationSlug);
  const where = location?.name ?? "SPILL";
  const firstName = input.name?.trim().split(/\s+/)[0];
  const hi = firstName ? `Hi ${firstName}, ` : "";
  const page = `${input.origin}/whats-on`;

  const heading = input.updated ? "You're already on the list." : "You're on the list.";
  const body = input.updated
    ? `${hi}you were already signed up for ${where} news, so we've updated your details.`
    : `${hi}thanks for joining. You'll be first to hear about opening news, first events and early booking at ${where}.`;

  return sendEmail({
    to: input.to,
    subject: input.updated ? `Your ${where} details are updated` : `Welcome to ${where}`,
    text: `${heading}\n\n${body}\n\nSee what's on: ${page}\n\n${FOOTER}`,
    html: emailHtml({ brand: where.toUpperCase(), heading, body, cta: { label: "See what's on", href: page }, footer: FOOTER }),
    tag: "waitlist",
  });
}
