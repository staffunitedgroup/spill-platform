import { isSupportedCountry, parsePhoneNumberFromString } from "libphonenumber-js";
import { prisma } from "@/lib/prisma";
import { waitlistSchema } from "@/lib/validation/waitlist";

export const runtime = "nodejs";

// Same light, per-instance rate limit as /api/inquiries.
const attempts = new Map<string, number[]>();

function rateLimited(ip: string) {
  const now = Date.now();
  const recent = (attempts.get(ip) ?? []).filter((time) => now - time < 10 * 60 * 1000);
  recent.push(now);
  attempts.set(ip, recent);
  return recent.length > 8;
}

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (rateLimited(ip)) {
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

  // Number + picked country → "+84 90 123 4567". A number typed with its own
  // "+code" wins over the picker; a leading 0 (e.g. 090…) is handled too.
  let phone: string | null = null;
  if (whatsapp) {
    const country = whatsappCountry && isSupportedCountry(whatsappCountry) ? whatsappCountry : "VN";
    const parsedPhone = parsePhoneNumberFromString(whatsapp, country);
    if (!parsedPhone?.isPossible()) {
      return Response.json({ error: "Please check your WhatsApp number." }, { status: 400 });
    }
    phone = parsedPhone.formatInternational();
  }

  const details = {
    name: name || null,
    whatsapp: phone,
    interests,
    source: source ?? null,
  };

  try {
    // Signing up twice just refreshes their details instead of failing.
    const existing = await prisma.waitlistSignup.findUnique({
      where: { email_locationSlug: { email, locationSlug } },
      select: { interests: true },
    });
    await prisma.waitlistSignup.upsert({
      where: { email_locationSlug: { email, locationSlug } },
      create: { email, locationSlug, ...details },
      update: {
        ...(details.name ? { name: details.name } : {}),
        ...(details.whatsapp ? { whatsapp: details.whatsapp } : {}),
        // Keep what they asked for before and add anything new.
        interests: Array.from(new Set([...(existing?.interests ?? []), ...interests])),
      },
    });
  } catch (error) {
    console.error("[waitlist] could not save sign-up", error);
    return Response.json({ error: "We couldn't save that just now. Please try again in a moment." }, { status: 500 });
  }

  return Response.json({ ok: true });
}
