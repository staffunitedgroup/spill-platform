import Link from "next/link";
import { localNavigation, locations, type Location } from "@/lib/site-data";

export function LocalHeader({ location }: { location: Location }) {
  return <header className="localHeader">
    <details className="locationSwitcher"><summary>{location.name} <span>⌄</span></summary><div className="dropdownPanel">
      <Link href="/">Global SPILL</Link>
      {locations.map((item) => <Link key={item.slug} href={`/${item.slug}`}>{item.name}<small>{item.status === "open" ? "Open now" : "Coming soon"}</small></Link>)}
    </div></details>
    <nav className="localNav" aria-label={`${location.name} navigation`}>
      {localNavigation.map((item) => <Link key={item.path || "home"} href={`/${location.slug}${item.path ? `/${item.path}` : ""}`}>{item.label}</Link>)}
    </nav>
  </header>;
}
