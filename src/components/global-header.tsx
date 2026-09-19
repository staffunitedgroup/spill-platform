import Link from "next/link";
import Image from "next/image";
import { HoverDropdown } from "./hover-dropdown";
import { corporateNavigation, globalNavigation, locations, locationStatus } from "@/lib/site-data";

export function GlobalHeader() {
  return <header className="siteHeader">
    <Link className="brand brandLogo" href="/" aria-label="SPILL home"><Image src="/assets/spill/brand/wordmark-bright.png" alt="SPILL" width={1580} height={250} priority /></Link>
    <nav className="desktopNav" aria-label="Global navigation">
      <HoverDropdown className="navDropdown" summary={<>Locations <span>⌄</span></>}><div className="dropdownPanel">
        {locations.map((location) => <Link key={location.slug} href={`/${location.slug}`}><span>{location.name}</span><small>{locationStatus(location)}</small></Link>)}
        <span className="dropdownSoon">More locations coming</span>
      </div></HoverDropdown>
      {globalNavigation.map((item) => <HoverDropdown className="navDropdown" key={item.href} summary={<><Link href={item.href}>{item.label}</Link> <span>⌄</span></>}><div className="dropdownPanel">
        {item.items.map((child) => <Link key={child.label} href={child.href}>{child.label}<span>↗</span></Link>)}
      </div></HoverDropdown>)}
      <div className="corporateNav">{corporateNavigation.map((item) => <Link key={item.href} href={item.href}>{item.label}</Link>)}</div>
    </nav>
    <details className="mobileMenu">
      <summary aria-label="Open navigation"><span /><span /></summary>
      <nav aria-label="Mobile navigation">
        <p>Navigate SPILL</p>
        <Link href="/">SPILL Global<span>↗</span></Link>
        <Link href="/#locations">Locations<span>↘</span></Link>
        {globalNavigation.map((item) => <Link key={item.href} href={item.href}>{item.label}<span>↗</span></Link>)}
        {corporateNavigation.map((item) => <Link key={item.href} href={item.href}>{item.label}<span>↗</span></Link>)}
      </nav>
    </details>
  </header>;
}
