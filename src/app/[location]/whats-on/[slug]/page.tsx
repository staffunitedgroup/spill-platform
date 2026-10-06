import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { LocalHeader } from "@/components/local-header";
import { RsvpForm } from "@/components/rsvp-form";
import { ShareEvent } from "@/components/share-event";
import {
  CATEGORY_META,
  eventEnd,
  eventImage,
  formatEventDate,
  formatEventTime,
  youtubeId,
} from "@/lib/event-meta";
import { getPublicEvent } from "@/lib/events";
import { getLocation } from "@/lib/site-data";

type Props = { params: Promise<{ location: string; slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { location: slug, slug: eventSlug } = await params;
  const location = getLocation(slug);
  const event = location ? await getPublicEvent(location.slug, eventSlug) : null;
  if (!location || !event) return {};
  const when = `${formatEventDate(event.startsAt, location.timezone, "long")} · ${formatEventTime(event.startsAt, location.timezone)}`;
  return {
    title: `${event.title} — ${location.name}`,
    description: `${when}. ${event.summary}`,
    openGraph: {
      title: event.title,
      description: `${when} at ${location.name}. ${event.summary}`,
      images: [eventImage(event)],
      type: "website",
    },
  };
}

export default async function EventPage({ params }: Props) {
  const { location: slug, slug: eventSlug } = await params;
  const location = getLocation(slug);
  if (!location) notFound();
  const event = await getPublicEvent(location.slug, eventSlug);
  if (!event) notFound();

  const tz = location.timezone;
  const now = new Date();
  const end = eventEnd(event);
  const isOver = end < now;
  const isOn = event.startsAt <= now && !isOver;
  const video = youtubeId(event.youtubeUrl);
  const path = `/${location.slug}/whats-on/${event.slug}`;
  const meta = CATEGORY_META[event.category];

  return (
    <main className="portalPage eventPage">
      <div className="portalHeaderWrap">
        <LocalHeader location={location} />
      </div>

      <section className="eventHero">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="eventHeroMedia" src={eventImage(event)} alt="" />
        <div className="eventHeroVeil" />
        <div className="eventHeroContent">
          <Link className="eventBack" href={`/${location.slug}/whats-on`}>
            ← What’s on at {location.name}
          </Link>
          <p className="eventHeroTags">
            <span className={`eventTag cat-${meta.filter}`}>{meta.label}</span>
            {isOn && <span className="eventTag live">● {event.category === "LIVE" ? "Live now" : "Happening now"}</span>}
            {isOver && <span className="eventTag past">Finished</span>}
          </p>
          <h1>{event.title}</h1>
          <p className="eventHeroWhen">
            {formatEventDate(event.startsAt, tz, "long")}
            <span>
              {formatEventTime(event.startsAt, tz)}
              {event.endsAt ? ` – ${formatEventTime(event.endsAt, tz)}` : ""}
            </span>
            <span>{location.name}</span>
          </p>
          {!isOver && (event.rsvpEnabled || event.ticketUrl) && (
            <div className="actions">
              {event.ticketUrl ? (
                <a className="button primary" href={event.ticketUrl} target="_blank" rel="noreferrer">
                  Get tickets <span>↗</span>
                </a>
              ) : (
                <a className="button primary" href="#rsvp">
                  I’m coming <span>→</span>
                </a>
              )}
            </div>
          )}
        </div>
      </section>

      <div className="eventBody">
        <article className="eventAbout">
          <p className="eventLead">{event.summary}</p>
          {event.description
            .split(/\n{2,}/)
            .map((para) => para.trim())
            .filter(Boolean)
            .map((para, i) => (
              <p key={i}>{para}</p>
            ))}

          {video && (
            <div className="eventVideo">
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${video}`}
                title={event.title}
                loading="lazy"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>
          )}

          <ShareEvent path={path} title={event.title} calendarPath={`${path}/calendar`} />
        </article>

        <aside className="eventSide">
          {isOver ? (
            <div className="inquiryForm rsvpForm rsvpDone">
              <p className="eyebrow">This one has finished</p>
              <h3>Don’t miss the next one.</h3>
              <Link className="textLink" href={`/${location.slug}/whats-on`}>
                See what’s coming up <span>→</span>
              </Link>
            </div>
          ) : event.rsvpEnabled ? (
            <RsvpForm eventId={event.id} eventTitle={event.title} />
          ) : event.ticketUrl ? (
            <div className="inquiryForm rsvpForm rsvpDone">
              <p className="eyebrow">Tickets</p>
              <h3>Tickets are sold through our partner.</h3>
              <a className="button primary" href={event.ticketUrl} target="_blank" rel="noreferrer">
                Get tickets <span>↗</span>
              </a>
            </div>
          ) : (
            <div className="inquiryForm rsvpForm rsvpDone">
              <p className="eyebrow">Just come by</p>
              <h3>No sign-up needed.</h3>
              <p>See you at {location.name}.</p>
            </div>
          )}
        </aside>
      </div>
    </main>
  );
}
