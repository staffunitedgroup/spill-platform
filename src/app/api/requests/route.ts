import { after } from "next/server";
import { emailConfigured, sendBookingConfirmation, sendBookingToTeam } from "@/lib/guest-emails";
import { normalizePhone } from "@/lib/phone";
import { prisma } from "@/lib/prisma";
import { clientIp, rateLimited } from "@/lib/rate-limit";
import { siteOrigin } from "@/lib/spill-email";
import { bookingRequestSchema } from "@/lib/validation/booking";

export const runtime = "nodejs";

// POST /api/requests — "Work with SPILL": livestream, podcast and Confessional requests.
// Saved for the team in /admin/requests; the guest and the team both get an email.
export async function POST(request: Request) {
  if (rateLimited(`requests:${clientIp(request)}`, 6)) {
    return Response.json({ error: "Too many requests from here. Please try again shortly." }, { status: 429 });
  }

  const parsed = bookingRequestSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message;
    return Response.json({ error: message && !message.startsWith("Invalid") ? message : "Please check the form and try again." }, { status: 400 });
  }
  const { website, kind, name, email, whatsapp, whatsappCountry, summary } = parsed.data;
  if (website) return Response.json({ ok: true });

  const phone = normalizePhone(whatsapp, whatsappCountry);
  if (phone === "invalid") return Response.json({ error: "Please check your WhatsApp number." }, { status: 400 });

  const fields = parsed.data.fields.filter((f) => f.value);
  try {
    const saved = await prisma.bookingRequest.create({
      data: { kind, name, email, whatsapp: phone, summary, fields },
    });
    const origin = siteOrigin(request);
    const forEmail = { id: saved.id, kind, name, email, whatsapp: phone, summary, fields };
    after(async () => {
      await Promise.all([
        sendBookingConfirmation(forEmail, origin).catch((error) => console.error("[requests] guest email failed", error)),
        sendBookingToTeam(forEmail, origin).catch((error) => console.error("[requests] team email failed", error)),
      ]);
    });
  } catch (error) {
    console.error("[requests] could not save", error);
    return Response.json({ error: "We couldn't send that just now. Please try again or email hello@spillcafebar.com." }, { status: 500 });
  }

  return Response.json({ ok: true, emailed: emailConfigured() });
}
