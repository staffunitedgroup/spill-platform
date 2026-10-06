import Link from "next/link";
import { CATEGORY_META, eventImage, formatEventTime, formatEventDate, type EventCategoryKey } from "@/lib/event-meta";
import { getLocation } from "@/lib/site-data";

export type EventCardData = {
  locationSlug: string;
  slug: string;
  title: string;
  summary: string;
  category: EventCategoryKey;
  startsAt: Date;
  endsAt: Date | null;
  imageUrl: string | null;
};

/** One event in a list. Times are shown in the venue's own time zone. */
export function EventCard({ event, showLocation = false, showDate = true }: { event: EventCardData; showLocation?: boolean; showDate?: boolean }) {
  const location = getLocation(event.locationSlug);
  const timeZone = location?.timezone ?? "Asia/Ho_Chi_Minh";
  const time = formatEventTime(event.startsAt, timeZone);
  return (
    <Link className="eventCard" href={`/${event.locationSlug}/whats-on/${event.slug}`}>
      <div className="eventCardMedia">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={eventImage(event)} alt="" loading="lazy" decoding="async" />
        <span className={`eventTag cat-${CATEGORY_META[event.category].filter}`}>{CATEGORY_META[event.category].label}</span>
      </div>
      <div className="eventCardBody">
        <p className="eventCardWhen">
          {showDate ? `${formatEventDate(event.startsAt, timeZone)} · ${time}` : time}
          {showLocation && location ? <span> · {location.name}</span> : null}
        </p>
        <h3>{event.title}</h3>
        <p className="eventCardSummary">{event.summary}</p>
        <b className="eventCardMore">
          Details <span>→</span>
        </b>
      </div>
    </Link>
  );
}
