import Link from "next/link";
import Image from "next/image";
import { HoverDropdown } from "./hover-dropdown";
import { localCreateNavigation, localNavigation, locations, locationStatus, type Location } from "@/lib/site-data";
import { NavArrow } from "./nav-arrow";

function locationCreateHref(href: string, location: Location) {
  return href.startsWith("/saigon/") ? href.replace("/saigon/", `/${location.slug}/`) : href;
}

export function LocalHeader({ location }: { location: Location }) {
  return <header className="localHeader">
    <Link className="brand brandLogo localBrandLogo" href="/" aria-label="SPILL global home"><Image src="/assets/spill/brand/wordmark-bright.png" alt="SPILL" width={1580} height={250} /></Link>
    <HoverDropdown className="locationSwitcher" summary={<>{location.name} <span>⌄</span></>}><div className="dropdownPanel">
      <Link href="/">Global SPILL</Link>
      {locations.map((item) => <Link key={item.slug} href={`/${item.slug}`}>{item.name}<small>{locationStatus(item)}</small></Link>)}
    </div></HoverDropdown>
    <nav className="localNav" aria-label={`${location.name} navigation`}>
      {localNavigation.map((item) => item.path === "create" ? <HoverDropdown className="navDropdown localCreateDropdown" key={item.path} summary={<><Link href={`/${location.slug}/create`}>{item.label}</Link> <span>⌄</span></>}><div className="dropdownPanel">{localCreateNavigation.map((child) => <Link key={child.label} href={locationCreateHref(child.href, location)}>{child.label}<NavArrow /></Link>)}</div></HoverDropdown> : <Link key={item.path || "home"} href={`/${location.slug}${item.path ? `/${item.path}` : ""}`}>{item.label}</Link>)}
    </nav>
    <details className="mobileMenu localMobileMenu"><summary aria-label={`Open ${location.name} navigation`}><span /><span /></summary><nav aria-label={`${location.name} mobile navigation`}><p>{location.name}</p>{localNavigation.map((item) => <Link key={item.path || "home"} href={`/${location.slug}${item.path ? `/${item.path}` : ""}`}>{item.label}<NavArrow /></Link>)}<p>Create directly</p>{localCreateNavigation.map((child) => <Link key={child.label} href={locationCreateHref(child.href, location)}>{child.label}<NavArrow /></Link>)}</nav></details>
  </header>;
}
