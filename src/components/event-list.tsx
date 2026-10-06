import Link from "next/link";
import { EventCard, type EventCardData } from "@/components/event-card";
import { dayLabel, EVENT_FILTERS, spillDayStart } from "@/lib/event-meta";

/** Filter chips — plain links, so a filtered list can be shared and works without JavaScript. */
export function EventFilters({ basePath, active }: { basePath: string; active: string }) {
  return (
    <nav className="whatsOnFilters" aria-label="Filter events">
      {EVENT_FILTERS.map((f) => (
        <Link
          key={f.key || "all"}
          href={f.key ? `${basePath}?filter=${f.key}` : basePath}
          className={active === f.key ? "active" : undefined}
          aria-current={active === f.key ? "page" : undefined}
          scroll={false}
        >
          {f.label}
        </Link>
      ))}
    </nav>
  );
}

/** Events grouped by day: "Tonight", "Tomorrow", "Friday 10 October"… */
export function EventDays({
  events,
  timeZone,
  showLocation = false,
  now,
}: {
  events: EventCardData[];
  timeZone: string;
  showLocation?: boolean;
  now: Date;
}) {
  const groups = new Map<number, EventCardData[]>();
  for (const event of events) {
    const key = spillDayStart(event.startsAt < now ? now : event.startsAt, timeZone).getTime();
    groups.set(key, [...(groups.get(key) ?? []), event]);
  }
  return (
    <div className="eventDays">
      {[...groups.entries()].map(([key, dayEvents]) => (
        <section className="eventDay" key={key} aria-label={dayLabel(new Date(key + 12 * 3600_000), timeZone, now)}>
          <h2>{dayLabel(new Date(key + 12 * 3600_000), timeZone, now)}</h2>
          <div className="eventGrid">
            {dayEvents.map((event) => (
              <EventCard key={`${event.locationSlug}/${event.slug}`} event={event} showLocation={showLocation} showDate={false} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
