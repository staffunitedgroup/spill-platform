import "server-only";
import { NextResponse } from "next/server";
import type { Prisma } from "@/generated/prisma/client";
import { parseLocalDateTime, slugify } from "@/lib/event-meta";
import { prisma } from "@/lib/prisma";
import { getLocation } from "@/lib/site-data";
import type { EventInput } from "@/lib/validation/event";

export function unauthorized() {
  return NextResponse.json({ error: { code: "UNAUTHORIZED", message: "Invalid admin password." } }, { status: 401 });
}

export function badRequest(message: string) {
  return NextResponse.json({ error: { code: "INVALID", message } }, { status: 400 });
}

/** A slug not yet used at this location ("jazz-night", "jazz-night-2", …). */
async function uniqueSlug(locationSlug: string, wanted: string, exceptId?: string) {
  const base = wanted || "event";
  for (let n = 1; n < 100; n += 1) {
    const candidate = n === 1 ? base : `${base}-${n}`;
    const taken = await prisma.event.findFirst({
      where: { locationSlug, slug: candidate, ...(exceptId ? { NOT: { id: exceptId } } : {}) },
      select: { id: true },
    });
    if (!taken) return candidate;
  }
  return `${base}-${Date.now().toString(36)}`;
}

/** Form input → database fields. Returns an error message instead when invalid. */
export async function toEventData(
  input: EventInput,
  exceptId?: string,
): Promise<{ data: Prisma.EventUncheckedCreateInput } | { error: string }> {
  const location = getLocation(input.locationSlug);
  if (!location) return { error: "Unknown location." };

  const startsAt = parseLocalDateTime(input.startsAt, location.timezone);
  if (!startsAt) return { error: "Please pick a start date and time." };
  const endsAt = input.endsAt ? parseLocalDateTime(input.endsAt, location.timezone) : null;
  if (endsAt && endsAt <= startsAt) return { error: "The end time must be after the start time." };

  const slug = await uniqueSlug(input.locationSlug, input.slug || slugify(input.title), exceptId);

  return {
    data: {
      locationSlug: input.locationSlug,
      slug,
      title: input.title,
      summary: input.summary,
      description: input.description || "",
      category: input.category,
      startsAt,
      endsAt,
      imageUrl: input.imageUrl || null,
      ticketUrl: input.ticketUrl || null,
      youtubeUrl: input.youtubeUrl || null,
      rsvpEnabled: input.rsvpEnabled,
      featured: input.featured,
      published: input.published,
    },
  };
}
