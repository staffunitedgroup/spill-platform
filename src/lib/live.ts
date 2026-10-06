import "server-only";
import { DEFAULT_EVENT_HOURS } from "@/lib/event-meta";
import type { PublicEvent } from "@/lib/events";
import { prisma } from "@/lib/prisma";
import { socialLinks } from "@/lib/site-data";
import { parseChannelFeed, type ChannelVideo } from "@/lib/youtube-feed";

export type { ChannelVideo };

// ── Live status (from the What's On calendar) ────────────────
// A livestream is an event with category LIVE. That keeps one calendar for
// the team: schedule it in /admin/events and SPILL Live picks it up.

export type LiveStatus = {
  /** At least one livestream has started — SPILL Live shows in the menus. */
  launched: boolean;
  /** A livestream happening right now, if any. */
  liveNow: PublicEvent | null;
};

let statusCache: { at: number; value: LiveStatus } | null = null;
const STATUS_TTL_MS = 30_000;

export async function getLiveStatus(): Promise<LiveStatus> {
  if (statusCache && Date.now() - statusCache.at < STATUS_TTL_MS) return statusCache.value;
  const now = new Date();
  let value: LiveStatus = { launched: false, liveNow: null };
  try {
    const [started, current] = await Promise.all([
      prisma.event.findFirst({
        where: { published: true, category: "LIVE", startsAt: { lte: now } },
        select: { id: true },
      }),
      prisma.event.findFirst({
        where: {
          published: true,
          category: "LIVE",
          startsAt: { lte: now },
          OR: [
            { endsAt: { gt: now } },
            { endsAt: null, startsAt: { gt: new Date(now.getTime() - DEFAULT_EVENT_HOURS * 3600_000) } },
          ],
        },
        // Prefer one with a YouTube link (it can be played on the page).
        orderBy: [{ youtubeUrl: { sort: "desc", nulls: "last" } }, { startsAt: "desc" }],
      }),
    ]);
    value = { launched: Boolean(started), liveNow: (current as PublicEvent | null) ?? null };
  } catch (error) {
    console.error("[live] status failed", error);
  }
  statusCache = { at: Date.now(), value };
  return value;
}

// ── Latest videos (YouTube channel feed, no API key needed) ──

const FEED_REVALIDATE_SECONDS = 15 * 60;

/** The channel to show: YOUTUBE_CHANNEL_ID, or worked out from the @handle. */
export function youtubeChannelUrl() {
  return socialLinks.find((link) => link.label === "YouTube")?.href ?? "https://www.youtube.com/@NowWeSPILL";
}

function handleFromUrl(url: string) {
  return url.match(/youtube\.com\/@([\w.-]+)/)?.[1] ?? null;
}

let channelIdCache: string | null = null;

async function resolveChannelId(): Promise<string | null> {
  const configured = process.env.YOUTUBE_CHANNEL_ID?.trim();
  if (configured) return configured;
  if (channelIdCache) return channelIdCache;
  const handle = process.env.YOUTUBE_CHANNEL_HANDLE?.trim() || handleFromUrl(youtubeChannelUrl());
  if (!handle) return null;
  try {
    const res = await fetch(`https://www.youtube.com/@${handle}`, {
      headers: { "Accept-Language": "en", "User-Agent": "Mozilla/5.0 (SPILL website)" },
      next: { revalidate: 24 * 3600 },
    });
    if (!res.ok) return null;
    const html = await res.text();
    const id =
      html.match(/<link rel="canonical" href="https:\/\/www\.youtube\.com\/channel\/(UC[\w-]{22})"/)?.[1] ??
      html.match(/"externalId":"(UC[\w-]{22})"/)?.[1] ??
      html.match(/"channelId":"(UC[\w-]{22})"/)?.[1] ??
      null;
    if (id) channelIdCache = id;
    else console.error(`[live] could not find the channel id for @${handle} — set YOUTUBE_CHANNEL_ID`);
    return id;
  } catch (error) {
    console.error("[live] channel lookup failed", error);
    return null;
  }
}

/** Latest videos from the channel (up to 15). Empty when YouTube can't be reached. */
export async function getChannelVideos(): Promise<ChannelVideo[]> {
  try {
    // YOUTUBE_FEED_URL lets a test or staging site point at a saved feed.
    let url = process.env.YOUTUBE_FEED_URL?.trim();
    if (!url) {
      const channelId = await resolveChannelId();
      if (!channelId) return [];
      url = `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`;
    }
    const res = await fetch(url, { next: { revalidate: FEED_REVALIDATE_SECONDS } });
    if (!res.ok) {
      console.error(`[live] video feed returned ${res.status}`);
      return [];
    }
    return parseChannelFeed(await res.text());
  } catch (error) {
    console.error("[live] video feed failed", error);
    return [];
  }
}
