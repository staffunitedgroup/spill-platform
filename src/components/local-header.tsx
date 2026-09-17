import Link from "next/link";
import Image from "next/image";
import { localNavigation, locations, locationStatus, type Location } from "@/lib/site-data";

export function LocalHeader({ location }: { location: Location }) {
  return <header className="localHeader">
    <Link className="brand brandLogo localBrandLogo" href="/" aria-label="SPILL global home"><Image src="/assets/spill/brand/wordmark-bright.png" alt="SPILL" width={1580} height={250} /></Link>
    <details className="locationSwitcher"><summary>{location.name} <span>⌄</span></summary><div className="dropdownPanel">
      <Link href="/">Global SPILL</Link>
      {locations.map((item) => <Link key={item.slug} href={`/${item.slug}`}>{item.name}<small>{locationStatus(item)}</small></Link>)}
    </div></details>
    <nav className="localNav" aria-label={`${location.name} navigation`}>
      {localNavigation.map((item) => <Link key={item.path || "home"} href={`/${location.slug}${item.path ? `/${item.path}` : ""}`}>{item.label}</Link>)}
    </nav>
  </header>;
}
