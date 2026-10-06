import Link from "next/link";
import { getLiveStatus } from "@/lib/live";
import { getLocation } from "@/lib/site-data";

/** A slim "● Live now" bar that only appears while a livestream is on. */
export async function LiveNowBanner() {
  const { liveNow } = await getLiveStatus();
  if (!liveNow) return null;
  const location = getLocation(liveNow.locationSlug);
  return (
    <Link className="liveNowBanner" href="/live">
      <span className="liveDot">Live now</span>
      <b>{liveNow.title}</b>
      {location && <small>{location.name}</small>}
      <em>
        Watch <span>→</span>
      </em>
    </Link>
  );
}
