import { eventEnd } from "@/lib/event-meta";
import { getPublicEvent } from "@/lib/events";
import { getLocation } from "@/lib/site-data";

/** iCalendar date-time in UTC: 20261010T130000Z */
function icsTime(date: Date) {
  return date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

/** Escape text for an .ics field and fold long lines (RFC 5545). */
function icsText(text: string) {
  return text.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");
}
function fold(line: string) {
  const out: string[] = [];
  let rest = line;
  while (rest.length > 74) {
    out.push(rest.slice(0, 74));
    rest = ` ${rest.slice(74)}`;
  }
  out.push(rest);
  return out.join("\r\n");
}

// GET /<location>/whats-on/<slug>/calendar — "Add to calendar" (.ics file).
export async function GET(request: Request, { params }: { params: Promise<{ location: string; slug: string }> }) {
  const { location: slug, slug: eventSlug } = await params;
  const location = getLocation(slug);
  const event = location ? await getPublicEvent(location.slug, eventSlug) : null;
  if (!location || !event) return new Response("Not found", { status: 404 });

  const url = new URL(`/${location.slug}/whats-on/${event.slug}`, process.env.NEXT_PUBLIC_SITE_URL || request.url).toString();
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//SPILL//Whats On//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${event.id}@spillcafebar.com`,
    `DTSTAMP:${icsTime(new Date())}`,
    `DTSTART:${icsTime(event.startsAt)}`,
    `DTEND:${icsTime(eventEnd(event))}`,
    `SUMMARY:${icsText(event.title)}`,
    `DESCRIPTION:${icsText(`${event.summary}\n\n${url}`)}`,
    `LOCATION:${icsText(location.name)}`,
    `URL:${url}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].map(fold);

  return new Response(lines.join("\r\n") + "\r\n", {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="${event.slug}.ics"`,
      "Cache-Control": "no-store",
    },
  });
}
