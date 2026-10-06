import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BrandedText } from "@/components/brand-text";
import { EventDays, EventFilters } from "@/components/event-list";
import { LocalHeader } from "@/components/local-header";
import { EVENT_FILTERS } from "@/lib/event-meta";
import { listUpcomingEvents } from "@/lib/events";
import { getLocation, SPILL42_PLAY_HREF } from "@/lib/site-data";

type Props = {
  params: Promise<{ location: string }>;
  searchParams: Promise<{ filter?: string | string[] }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { location: slug } = await params;
  const location = getLocation(slug);
  if (!location) return {};
  return {
    title: `What’s on at ${location.name}`,
    description: `Events, SPILL 42 nights, music and livestreams at ${location.name}.`,
  };
}

export default async function LocationWhatsOn({ params, searchParams }: Props) {
  const { location: slug } = await params;
  const location = getLocation(slug);
  if (!location) notFound();

  const raw = (await searchParams).filter;
  const wanted = Array.isArray(raw) ? raw[0] : raw;
  const filter = EVENT_FILTERS.some((f) => f.key === wanted) ? (wanted as string) : "";
  const activeLabel = EVENT_FILTERS.find((f) => f.key === filter)?.label ?? "All";

  const [events, anyUpcoming] = await Promise.all([
    listUpcomingEvents({ locationSlug: location.slug, timeZone: location.timezone, filter }),
    filter ? listUpcomingEvents({ locationSlug: location.slug, timeZone: location.timezone, limit: 1 }) : null,
  ]);
  const hasAnyEvents = filter ? (anyUpcoming?.length ?? 0) > 0 : events.length > 0;
  const now = new Date();
  const basePath = `/${location.slug}/whats-on`;

  return (
    <main className="portalPage whatsOnPage">
      <div className="portalHeaderWrap">
        <LocalHeader location={location} />
      </div>
      <section className="portalHero whatsOnHero">
        <p className="eyebrow">{location.name}</p>
        <h1>
          <BrandedText text="What’s on" />
        </h1>
        <p>Events, SPILL 42 nights, music and livestreams. What’s happening at SPILL tonight — and the next reason to come back.</p>
      </section>

      {hasAnyEvents && <EventFilters basePath={basePath} active={filter} />}

      <div className="whatsOnBody">
        {events.length > 0 ? (
          <EventDays events={events} timeZone={location.timezone} now={now} />
        ) : hasAnyEvents ? (
          <div className="eventsEmpty">
            <h2>Nothing for “{activeLabel}” yet.</h2>
            <p>New nights are added all the time.</p>
            <Link className="textLink" href={basePath}>
              See everything coming up <span>→</span>
            </Link>
          </div>
        ) : (
          <div className="eventsEmpty">
            <p className="eyebrow">{location.status === "pre-launch" ? "Launching soon" : "Coming soon"}</p>
            <h2>The first nights are being planned.</h2>
            <p>Join the list and we’ll tell you first — opening night, SPILL 42 sessions, music and live shows.</p>
            <Link className="button primary" href={`/${location.slug}#waitlist`}>
              Join the list <span>→</span>
            </Link>
          </div>
        )}
      </div>

      <section className="whatsOnSpill42">
        <div>
          <p className="eyebrow">At your table</p>
          <h2>Playing SPILL 42 tonight?</h2>
          <p>Scan the QR on your table — or enter its code — to start.</p>
        </div>
        <Link className="button primary" href={SPILL42_PLAY_HREF}>
          Play SPILL 42 <span>→</span>
        </Link>
      </section>
    </main>
  );
}
