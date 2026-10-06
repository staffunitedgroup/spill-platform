import { eventEnd } from "@/lib/event-meta";
import { normalizePhone } from "@/lib/phone";
import { prisma } from "@/lib/prisma";
import { clientIp, rateLimited } from "@/lib/rate-limit";
import { rsvpSchema } from "@/lib/validation/event";
import { addToWaitlist } from "@/lib/waitlist";

export const runtime = "nodejs";

// POST /api/events/:id/rsvp — "I'm coming". Also adds the guest to the waitlist.
export async function POST(request: Request, { params }: { params: Promise<{ eventId: string }> }) {
  if (rateLimited(`rsvp:${clientIp(request)}`, 10)) {
    return Response.json({ error: "Too many sign-ups from here. Please try again shortly." }, { status: 429 });
  }

  const parsed = rsvpSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message;
    return Response.json({ error: message && !message.startsWith("Invalid") ? message : "Please check the form and try again." }, { status: 400 });
  }
  const { website, email, name, whatsapp, whatsappCountry, partySize } = parsed.data;
  if (website) return Response.json({ ok: true });

  const phone = normalizePhone(whatsapp, whatsappCountry);
  if (phone === "invalid") return Response.json({ error: "Please check your WhatsApp number." }, { status: 400 });

  const { eventId } = await params;
  try {
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: { id: true, slug: true, locationSlug: true, published: true, rsvpEnabled: true, startsAt: true, endsAt: true },
    });
    if (!event || !event.published) return Response.json({ error: "This event isn’t available." }, { status: 404 });
    if (!event.rsvpEnabled) return Response.json({ error: "Sign-ups aren’t open for this event." }, { status: 400 });
    if (eventEnd(event) < new Date()) return Response.json({ error: "This event has already finished." }, { status: 400 });

    // Signing up again just updates the details.
    await prisma.eventRsvp.upsert({
      where: { eventId_email: { eventId, email } },
      create: { eventId, email, name, whatsapp: phone, partySize },
      update: { name, partySize, ...(phone ? { whatsapp: phone } : {}) },
    });
    await addToWaitlist({
      email,
      locationSlug: event.locationSlug,
      name,
      whatsapp: phone,
      interests: ["Events"],
      source: `event:${event.slug}`,
    });
  } catch (error) {
    console.error("[rsvp] could not save", error);
    return Response.json({ error: "We couldn't save that just now. Please try again in a moment." }, { status: 500 });
  }

  return Response.json({ ok: true });
}
