import type { Metadata } from "next";
import { BrandedText } from "@/components/brand-text";
import { EventDays, EventFilters } from "@/components/event-list";
import { GlobalHeader } from "@/components/global-header";
import { PortalPage } from "@/components/portal-page";
import { EVENT_FILTERS } from "@/lib/event-meta";
import { listUpcomingEvents } from "@/lib/events";
import { globalPageContent } from "@/lib/page-content";

export const metadata: Metadata = {
  title: "What’s on across SPILL",
  description: "Events, SPILL 42 nights, music and livestreams across every SPILL location.",
};

// Grouping by day uses SPILL's home time zone; each card shows its venue's own time.
const HOME_TIME_ZONE = "Asia/Ho_Chi_Minh";

export default async function Page({ searchParams }: { searchParams: Promise<{ filter?: string | string[] }> }) {
  const raw = (await searchParams).filter;
  const wanted = Array.isArray(raw) ? raw[0] : raw;
  const filter = EVENT_FILTERS.some((f) => f.key === wanted) ? (wanted as string) : "";

  const [events, anyUpcoming] = await Promise.all([
    listUpcomingEvents({ timeZone: HOME_TIME_ZONE, filter }),
    filter ? listUpcomingEvents({ timeZone: HOME_TIME_ZONE, limit: 1 }) : null,
  ]);
  const hasAnyEvents = filter ? (anyUpcoming?.length ?? 0) > 0 : events.length > 0;

  // Until the first event is published, keep the current overview page.
  if (!hasAnyEvents) return <PortalPage {...globalPageContent["whats-on"]} />;

  const content = globalPageContent["whats-on"];
  const activeLabel = EVENT_FILTERS.find((f) => f.key === filter)?.label ?? "All";
  return (
    <main className="portalPage whatsOnPage">
      <div className="portalHeaderWrap">
        <GlobalHeader />
      </div>
      <section className="portalHero whatsOnHero">
        <p className="eyebrow">{content.eyebrow}</p>
        <h1>
          <BrandedText text={content.title} />
        </h1>
        <p>Events, SPILL 42 nights, music and livestreams across every SPILL location.</p>
      </section>
      <EventFilters basePath="/whats-on" active={filter} />
      <div className="whatsOnBody">
        {events.length > 0 ? (
          <EventDays events={events} timeZone={HOME_TIME_ZONE} showLocation now={new Date()} />
        ) : (
          <div className="eventsEmpty">
            <h2>Nothing for “{activeLabel}” yet.</h2>
            <p>New nights are added all the time.</p>
          </div>
        )}
      </div>
    </main>
  );
}
