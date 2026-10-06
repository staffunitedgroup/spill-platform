import { normalizePhone } from "@/lib/phone";
import { clientIp, rateLimited } from "@/lib/rate-limit";
import { waitlistSchema } from "@/lib/validation/waitlist";
import { addToWaitlist } from "@/lib/waitlist";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (rateLimited(`waitlist:${clientIp(request)}`, 8)) {
    return Response.json({ error: "Too many sign-ups from here. Please try again shortly." }, { status: 429 });
  }

  const parsed = waitlistSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message;
    return Response.json({ error: message && !message.startsWith("Invalid") ? message : "Please check the form and try again." }, { status: 400 });
  }

  const { website, email, name, whatsapp, whatsappCountry, locationSlug, interests, source } = parsed.data;
  // Bots fill the hidden field — pretend it worked.
  if (website) return Response.json({ ok: true });

  const phone = normalizePhone(whatsapp, whatsappCountry);
  if (phone === "invalid") {
    return Response.json({ error: "Please check your WhatsApp number." }, { status: 400 });
  }

  try {
    await addToWaitlist({ email, locationSlug, name, whatsapp: phone, interests, source });
  } catch (error) {
    console.error("[waitlist] could not save sign-up", error);
    return Response.json({ error: "We couldn't save that just now. Please try again in a moment." }, { status: 500 });
  }

  return Response.json({ ok: true });
}
