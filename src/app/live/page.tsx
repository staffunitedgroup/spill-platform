import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { BrandedText } from "@/components/brand-text";
import { EventCard } from "@/components/event-card";
import { GlobalHeader } from "@/components/global-header";
import { VideoGallery } from "@/components/video-gallery";
import { formatEventTime, youtubeId } from "@/lib/event-meta";
import { listUpcomingEvents } from "@/lib/events";
import { getChannelVideos, getLiveStatus, youtubeChannelUrl } from "@/lib/live";
import { getLocation } from "@/lib/site-data";

export const metadata: Metadata = {
  title: "SPILL Live",
  description: "Watch what’s happening inside SPILL — live shows, conversations and the latest videos.",
};

export default async function LivePage({ searchParams }: { searchParams: Promise<{ preview?: string }> }) {
  const [{ launched, liveNow }, preview] = await Promise.all([getLiveStatus(), searchParams.then((s) => s.preview === "1")]);

  // Hidden until the first livestream, so nobody lands on an empty page.
  // ?preview=1 lets the team check it before then.
  if (!launched && !preview) redirect("/whats-on?filter=live");

  const [videos, upcomingAll] = await Promise.all([
    getChannelVideos(),
    listUpcomingEvents({ timeZone: "Asia/Ho_Chi_Minh", filter: "live", limit: 7 }),
  ]);
  const upcoming = upcomingAll.filter((e) => e.id !== liveNow?.id && e.startsAt > new Date()).slice(0, 6);
  const liveLocation = liveNow ? getLocation(liveNow.locationSlug) : null;
  const liveVideo = youtubeId(liveNow?.youtubeUrl);
  const channelUrl = youtubeChannelUrl();

  return (
    <main className="portalPage livePage">
      <div className="portalHeaderWrap">
        <GlobalHeader />
      </div>

      <section className="portalHero liveHero">
        <p className="eyebrow">{liveNow ? <span className="liveDot">Live now</span> : "Watch"}</p>
        <h1>
          <BrandedText text="SPILL Live" />
        </h1>
        <p>Conversations, performances and people — streamed from inside SPILL.</p>
      </section>

      {liveNow && (
        <section className="liveNow" aria-label="Live now">
          <div className="liveNowPlayer">
            {liveVideo ? (
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${liveVideo}?autoplay=1&mute=1&rel=0`}
                title={liveNow.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            ) : (
              <a className="liveNowFallback" href={channelUrl} target="_blank" rel="noreferrer">
                Watch on YouTube <span>↗</span>
              </a>
            )}
          </div>
          <div className="liveNowInfo">
            <p className="eyebrow">
              <span className="liveDot">Live now</span>
              {liveLocation ? ` · ${liveLocation.name}` : ""}
            </p>
            <h2>{liveNow.title}</h2>
            <p>{liveNow.summary}</p>
            {liveLocation && (
              <p className="liveNowWhen">
                Started {formatEventTime(liveNow.startsAt, liveLocation.timezone)}
                {liveNow.endsAt ? ` · until ${formatEventTime(liveNow.endsAt, liveLocation.timezone)}` : ""}
              </p>
            )}
            <Link className="textLink" href={`/${liveNow.locationSlug}/whats-on/${liveNow.slug}`}>
              Event details <span>→</span>
            </Link>
          </div>
        </section>
      )}

      <section className="liveSection" aria-labelledby="live-upcoming">
        <div className="liveSectionHead">
          <h2 id="live-upcoming">Coming up live</h2>
          <Link className="textLink" href="/whats-on?filter=live">
            Full schedule <span>→</span>
          </Link>
        </div>
        {upcoming.length > 0 ? (
          <div className="eventGrid">
            {upcoming.map((event) => (
              <EventCard key={event.id} event={event} showLocation />
            ))}
          </div>
        ) : (
          <p className="liveEmpty">The next livestream will be announced here — and on What’s On.</p>
        )}
      </section>

      <section className="liveSection" aria-labelledby="live-videos">
        <div className="liveSectionHead">
          <h2 id="live-videos">Latest videos</h2>
          <a className="textLink" href={channelUrl} target="_blank" rel="noreferrer">
            SPILL on YouTube <span>↗</span>
          </a>
        </div>
        {videos.length > 0 ? (
          <VideoGallery videos={videos} />
        ) : (
          <p className="liveEmpty">
            Watch every show and highlight on{" "}
            <a href={channelUrl} target="_blank" rel="noreferrer">
              SPILL’s YouTube channel ↗
            </a>
            .
          </p>
        )}
      </section>
    </main>
  );
}
