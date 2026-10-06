// Event helpers that are safe to use anywhere (server and browser):
// categories, filters, default images, YouTube links, and venue-local times.

export const EVENT_CATEGORIES = ["SPILL42", "MUSIC", "LIVE", "FOOD_DRINK", "COMMUNITY", "SPECIAL"] as const;
export type EventCategoryKey = (typeof EVENT_CATEGORIES)[number];

export const CATEGORY_META: Record<EventCategoryKey, { label: string; filter: string; image: string }> = {
  SPILL42: { label: "SPILL 42", filter: "spill-42", image: "/assets/spill/home/spill-42-poster.jpg" },
  MUSIC: { label: "Music", filter: "music", image: "/assets/spill/home/venue-night.jpg" },
  LIVE: { label: "Live", filter: "live", image: "/assets/spill/home/livestream-promotion-poster.jpg" },
  FOOD_DRINK: { label: "Food & Drink", filter: "food-drink", image: "/assets/spill/menu/hero-poster.jpg" },
  COMMUNITY: { label: "Community", filter: "community", image: "/assets/spill/home/common-area-poster.jpg" },
  SPECIAL: { label: "Special Events", filter: "special", image: "/assets/spill/home/hero-v2-poster.jpg" },
};

/** Filter chips on What's On, in the order of the sitemap plan. */
export const EVENT_FILTERS: Array<{ key: string; label: string; category?: EventCategoryKey }> = [
  { key: "", label: "All" },
  { key: "tonight", label: "Tonight" },
  { key: "this-week", label: "This week" },
  ...EVENT_CATEGORIES.map((category) => ({
    key: CATEGORY_META[category].filter,
    label: CATEGORY_META[category].label,
    category,
  })),
];

/** How long an event without an end time is assumed to last. */
export const DEFAULT_EVENT_HOURS = 3;

/** A SPILL "day" runs 05:00 → 05:00, so a 1am set still counts as tonight. */
const DAY_START_HOUR = 5;

export function eventImage(event: { imageUrl?: string | null; category: EventCategoryKey }) {
  return event.imageUrl || CATEGORY_META[event.category].image;
}

export function eventEnd(event: { startsAt: Date; endsAt?: Date | null }) {
  return event.endsAt ?? new Date(event.startsAt.getTime() + DEFAULT_EVENT_HOURS * 3600_000);
}

/** YouTube video ID from watch / youtu.be / live / embed / shorts links. */
export function youtubeId(url?: string | null) {
  if (!url) return null;
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\.|^m\./, "");
    if (host === "youtu.be") return u.pathname.slice(1).split("/")[0] || null;
    if (host === "youtube.com" || host === "youtube-nocookie.com") {
      const v = u.searchParams.get("v");
      if (v) return v;
      const match = u.pathname.match(/^\/(?:live|embed|shorts)\/([\w-]{6,})/);
      return match?.[1] ?? null;
    }
  } catch {
    /* not a URL */
  }
  return null;
}

// ── Venue-local time ─────────────────────────────────────────

type Parts = { year: number; month: number; day: number; hour: number; minute: number; weekday: string };

/** Wall-clock parts of an instant in a time zone. */
export function zonedParts(date: Date, timeZone: string): Parts {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-US", {
      timeZone,
      year: "numeric",
      month: "numeric",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      weekday: "short",
      hourCycle: "h23",
    })
      .formatToParts(date)
      .map((p) => [p.type, p.value]),
  );
  return {
    year: Number(parts.year),
    month: Number(parts.month),
    day: Number(parts.day),
    hour: Number(parts.hour),
    minute: Number(parts.minute),
    weekday: String(parts.weekday),
  };
}

/** The instant when the wall clock in `timeZone` reads the given time. */
export function zonedTimeToUtc(year: number, month: number, day: number, hour: number, minute: number, timeZone: string) {
  const guess = Date.UTC(year, month - 1, day, hour, minute);
  // Two passes handle the (rare) daylight-saving jump correctly.
  let result = guess;
  for (let i = 0; i < 2; i += 1) {
    const p = zonedParts(new Date(result), timeZone);
    const shown = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute);
    result += guess - shown;
  }
  return new Date(result);
}

/** "2026-10-10T20:00" (venue time, from <input type="datetime-local">) → Date. */
export function parseLocalDateTime(value: string, timeZone: string) {
  const m = value.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/);
  if (!m) return null;
  return zonedTimeToUtc(+m[1], +m[2], +m[3], +m[4], +m[5], timeZone);
}

/** Date → "2026-10-10T20:00" in venue time, for <input type="datetime-local">. */
export function toLocalInputValue(date: Date, timeZone: string) {
  const p = zonedParts(date, timeZone);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${p.year}-${pad(p.month)}-${pad(p.day)}T${pad(p.hour)}:${pad(p.minute)}`;
}

/** Start of the SPILL day (05:00 venue time) containing `date`, plus `offsetDays`. */
export function spillDayStart(date: Date, timeZone: string, offsetDays = 0) {
  const p = zonedParts(date, timeZone);
  const back = p.hour < DAY_START_HOUR ? -1 : 0;
  const base = new Date(Date.UTC(p.year, p.month - 1, p.day + back + offsetDays));
  return zonedTimeToUtc(base.getUTCFullYear(), base.getUTCMonth() + 1, base.getUTCDate(), DAY_START_HOUR, 0, timeZone);
}

export function formatEventTime(date: Date, timeZone: string) {
  return new Intl.DateTimeFormat("en-US", { timeZone, hour: "numeric", minute: "2-digit" }).format(date);
}

export function formatEventDate(date: Date, timeZone: string, style: "short" | "long" = "short") {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone,
    weekday: style === "long" ? "long" : "short",
    day: "numeric",
    month: style === "long" ? "long" : "short",
  }).format(date);
}

/** "Tonight", "Tomorrow", or "Friday 10 October" — for grouping a list by day. */
export function dayLabel(date: Date, timeZone: string, now = new Date()) {
  const today = spillDayStart(now, timeZone).getTime();
  const day = spillDayStart(date, timeZone).getTime();
  const diff = Math.round((day - today) / 86_400_000);
  if (diff === 0) return "Tonight";
  if (diff === 1) return "Tomorrow";
  return formatEventDate(date, timeZone, "long");
}

/** "Sat 10 Oct · 8:00 PM – 11:00 PM" */
export function formatEventWhen(event: { startsAt: Date; endsAt?: Date | null }, timeZone: string) {
  const start = `${formatEventDate(event.startsAt, timeZone)} · ${formatEventTime(event.startsAt, timeZone)}`;
  return event.endsAt ? `${start} – ${formatEventTime(event.endsAt, timeZone)}` : start;
}

/** Lowercase, accent-free URL slug ("Đêm nhạc Jazz!" → "dem-nhac-jazz"). */
export function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}
