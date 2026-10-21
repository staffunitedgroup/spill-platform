// Confirmation emails for website sign-ups (event RSVPs and the waitlist).
// They go through the same Resend account as the contact form. If email isn't
// set up, sign-ups still work — the guest just doesn't get an email.
import "server-only";
import { KIND_META, type RequestField, type RequestKindKey } from "@/lib/booking-meta";
import { formatEventWhen } from "@/lib/event-meta";
import { getLocation } from "@/lib/site-data";
import { emailConfigured, emailHtml, sendEmail } from "@/lib/spill-email";

export { emailConfigured };

const FOOTER = "You're receiving this because you signed up on the SPILL website. Questions? Email spill@nowwespill.com.";

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

// ── Work with SPILL: booking requests ─────────────────────────

type BookingEmail = {
  id: string;
  kind: RequestKindKey;
  name: string;
  email: string;
  whatsapp: string | null;
  summary: string;
  fields: RequestField[];
};

/** Who gets told about new requests (BOOKING_NOTIFY_EMAIL, else hello@). */
export function bookingNotifyAddress() {
  return process.env.BOOKING_NOTIFY_EMAIL?.trim() || "spill@nowwespill.com";
}

export async function sendBookingConfirmation(request: BookingEmail, origin: string) {
  const what = KIND_META[request.kind].label;
  const firstName = request.name.trim().split(/\s+/)[0] || "there";
  const heading = "We've got your request.";
  const body = `Hi ${firstName}, thanks for your ${what.toLowerCase()} request${request.summary ? `:\n${request.summary}` : "."}\n\nThe SPILL team will get back to you soon, usually within 2 working days.`;
  const page = `${origin}${KIND_META[request.kind].page}`;
  return sendEmail({
    to: request.email,
    subject: `Your SPILL ${what.toLowerCase()} request`,
    text: `${heading}\n\n${body}\n\n${FOOTER}`,
    html: emailHtml({ brand: "SPILL", heading, body, cta: { label: "Back to SPILL", href: page }, footer: FOOTER }),
    tag: "booking-request",
  });
}

export async function sendBookingToTeam(request: BookingEmail, origin: string) {
  const what = KIND_META[request.kind].label;
  const lines = [
    `Name: ${request.name}`,
    `Email: ${request.email}`,
    request.whatsapp ? `WhatsApp: ${request.whatsapp}` : "",
    ...request.fields.map((f) => `${f.label}: ${f.value}`),
  ].filter(Boolean);
  const admin = `${origin}/admin/requests`;
  const body = `${request.summary ? `${request.summary}\n\n` : ""}${lines.join("\n")}`;
  return sendEmail({
    to: bookingNotifyAddress(),
    replyTo: request.email,
    subject: `New ${what.toLowerCase()} request — ${request.name}`,
    text: `New ${what.toLowerCase()} request\n\n${body}\n\nOpen in Admin: ${admin}\nReply to this email to answer ${request.name} directly.`,
    html: emailHtml({
      brand: "SPILL ADMIN",
      heading: `New ${what.toLowerCase()} request`,
      body,
      cta: { label: "Open in Admin", href: admin },
      footer: `Reply to this email to answer ${request.name} directly.`,
    }),
    tag: "booking-request-team",
  });
}
