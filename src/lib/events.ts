import "server-only";
import type { Event, Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import {
  CATEGORY_META,
  DEFAULT_EVENT_HOURS,
  EVENT_CATEGORIES,
  spillDayStart,
  type EventCategoryKey,
} from "@/lib/event-meta";

export type PublicEvent = Pick<
  Event,
  | "id"
  | "locationSlug"
  | "slug"
  | "title"
  | "summary"
  | "description"
  | "startsAt"
  | "endsAt"
  | "imageUrl"
  | "ticketUrl"
  | "youtubeUrl"
  | "rsvpEnabled"
  | "featured"
> & { category: EventCategoryKey };

const PUBLIC_SELECT = {
  id: true,
  locationSlug: true,
  slug: true,
  title: true,
  summary: true,
  description: true,
  category: true,
  startsAt: true,
  endsAt: true,
  imageUrl: true,
  ticketUrl: true,
  youtubeUrl: true,
  rsvpEnabled: true,
  featured: true,
} satisfies Prisma.EventSelect;

/** Published events that haven't finished yet. */
function notOver(now: Date): Prisma.EventWhereInput {
  return {
    published: true,
    OR: [
      { endsAt: { gt: now } },
      { endsAt: null, startsAt: { gt: new Date(now.getTime() - DEFAULT_EVENT_HOURS * 3600_000) } },
    ],
  };
}

/**
 * The website must keep working if the events table is missing or the
 * database hiccups (e.g. code deployed before the migration) — show nothing
 * rather than a 500.
 */
async function safely<T>(label: string, run: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await run();
  } catch (error) {
    console.error(`[events] ${label} failed`, error);
    return fallback;
  }
}

export function categoryFromFilter(filter?: string): EventCategoryKey | undefined {
  return EVENT_CATEGORIES.find((c) => CATEGORY_META[c].filter === filter);
}

/** Upcoming events for one location (or all), filtered like the What's On chips. */
export async function listUpcomingEvents(options: {
  locationSlug?: string;
  timeZone: string;
  filter?: string;
  featuredOnly?: boolean;
  limit?: number;
}): Promise<PublicEvent[]> {
  const now = new Date();
  const and: Prisma.EventWhereInput[] = [notOver(now)];
  if (options.locationSlug) and.push({ locationSlug: options.locationSlug });
  if (options.featuredOnly) and.push({ featured: true });

  if (options.filter === "tonight") {
    and.push({ startsAt: { lt: spillDayStart(now, options.timeZone, 1) } });
  } else if (options.filter === "this-week") {
    and.push({ startsAt: { lt: spillDayStart(now, options.timeZone, 7) } });
  } else {
    const category = categoryFromFilter(options.filter);
    if (category) and.push({ category });
  }

  return safely(
    "listUpcomingEvents",
    async () =>
      (await prisma.event.findMany({
        where: { AND: and },
        orderBy: { startsAt: "asc" },
        take: options.limit ?? 60,
        select: PUBLIC_SELECT,
      })) as PublicEvent[],
    [],
  );
}

/** A published event by its URL (finished events stay reachable for shared links). */
export async function getPublicEvent(locationSlug: string, slug: string): Promise<PublicEvent | null> {
  return safely(
    "getPublicEvent",
    async () =>
      (await prisma.event.findFirst({
        where: { locationSlug, slug, published: true },
        select: PUBLIC_SELECT,
      })) as PublicEvent | null,
    null,
  );
}
