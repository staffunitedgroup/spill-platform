import Link from "next/link";
import Image from "next/image";
import { HoverDropdown } from "./hover-dropdown";
import { localCreateNavigation, localNavigation, locations, locationStatus, type Location } from "@/lib/site-data";
import { NavArrow } from "./nav-arrow";
import { MobileMenu, MobileNavGroup } from "./mobile-menu";
import { getLiveStatus } from "@/lib/live";

function locationCreateHref(href: string, location: Location) {
  return href.startsWith("/saigon/") ? href.replace("/saigon/", `/${location.slug}/`) : href;
}

/** "SPILL Saigon" → "Saigon". */
function cityName(location: Location) {
  return location.name.replace(/^SPILL\s+/i, "");
}

export async function LocalHeader({ location }: { location: Location }) {
  // "Live" appears after What's On once the first livestream has started.
  const { launched, liveNow } = await getLiveStatus();
  const liveLink = launched ? <Link key="live" href="/live" className={liveNow ? "navLive isLive" : "navLive"}>{liveNow ? "● Live now" : "Live"}</Link> : null;
  const liveMobile = launched ? <Link key="live" href="/live" className={liveNow ? "navLive isLive" : "navLive"}>{liveNow ? "● Live now" : "SPILL Live"}<NavArrow /></Link> : null;
  return <header className="localHeader">
    <Link className="brand brandLogo localBrandLogo" href="/" aria-label="SPILL global home"><Image src="/assets/spill/brand/wordmark-bright.png" alt="SPILL" width={1580} height={250} /></Link>
    {/* The logo already says SPILL — the switcher only names the city, as a small pill. */}
    <HoverDropdown className="locationSwitcher" summary={<><i aria-hidden="true" /><b>{cityName(location)}</b><span aria-hidden="true">⌄</span><em className="srOnly">Change location</em></>}><div className="dropdownPanel">
      <Link href="/">Global SPILL</Link>
      {locations.map((item) => <Link key={item.slug} href={`/${item.slug}`} aria-current={item.slug === location.slug ? "page" : undefined}>{item.name}<small>{item.slug === location.slug ? "You're here" : locationStatus(item)}</small></Link>)}
    </div></HoverDropdown>
    <nav className="localNav" aria-label={`${location.name} navigation`}>
      {localNavigation.map((item) => item.path === "create" ? <HoverDropdown className="navDropdown localCreateDropdown" key={item.path} summary={<><Link href={`/${location.slug}/create`}>{item.label}</Link> <span>⌄</span></>}><div className="dropdownPanel">{localCreateNavigation.map((child) => <Link key={child.label} href={locationCreateHref(child.href, location)}>{child.label}<NavArrow /></Link>)}</div></HoverDropdown> : [<Link key={item.path || "home"} href={`/${location.slug}${item.path ? `/${item.path}` : ""}`}>{item.label}</Link>, item.path === "whats-on" ? liveLink : null])}
    </nav>
    <MobileMenu className="localMobileMenu" label={`Open ${location.name} navigation`}><nav aria-label={`${location.name} mobile navigation`}>
      <p>{location.name}</p>
      {localNavigation.map((item) => item.path === "create"
        ? <MobileNavGroup key="create" label={item.label} href={`/${location.slug}/create`} items={localCreateNavigation.map((child) => ({ label: child.label, href: locationCreateHref(child.href, location) }))} />
        : [<Link key={item.path || "home"} href={`/${location.slug}${item.path ? `/${item.path}` : ""}`}>{item.label}<NavArrow /></Link>, item.path === "whats-on" ? liveMobile : null])}
      <MobileNavGroup label="Change location" href="/" overview="Global SPILL" items={locations.map((item) => ({ label: item.name, href: `/${item.slug}`, note: item.slug === location.slug ? "You're here" : locationStatus(item), current: item.slug === location.slug }))} />
    </nav></MobileMenu>
  </header>;
}
