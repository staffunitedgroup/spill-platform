import Link from "next/link";
import Image from "next/image";
import { locations, locationStatus } from "@/lib/site-data";

const experienceNavigation = [
  { label: "The SPILL Experience", href: "/#journey" },
  { label: "Livestream", href: "/#livestream" },
  { label: "Podcast", href: "/podcast" },
  { label: "Originals", href: "/#originals" },
  { label: "About", href: "/about" },
];

export function GlobalHeader() {
  return <header className="siteHeader">
    <Link className="brand brandLogo" href="/" aria-label="SPILL home"><Image src="/assets/spill/logo-horizontal-bright.webp" alt="SPILL" width={900} height={300} priority /></Link>
    <nav className="desktopNav" aria-label="Global navigation">
      <details className="navDropdown"><summary>Locations <span>⌄</span></summary><div className="dropdownPanel">
        {locations.map((location) => <Link key={location.slug} href={`/${location.slug}`}><span>{location.name}</span><small>{locationStatus(location)}</small></Link>)}
        <span className="dropdownSoon">More locations coming</span>
      </div></details>
      {experienceNavigation.map((item) => <Link key={item.href} href={item.href}>{item.label}</Link>)}
    </nav>
    <details className="mobileMenu">
      <summary aria-label="Open navigation"><span /><span /></summary>
      <nav aria-label="Mobile navigation">
        <p>Navigate SPILL</p>
        {experienceNavigation.map((item) => <Link key={item.href} href={item.href}>{item.label}<span>↗</span></Link>)}
        <Link href="/#locations">Choose a location<span>↘</span></Link>
      </nav>
    </details>
  </header>;
}
