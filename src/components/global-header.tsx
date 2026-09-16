import Link from "next/link";
import { globalNavigation, locations } from "@/lib/site-data";

export function GlobalHeader() {
  return <header className="siteHeader">
    <Link className="brand" href="/" aria-label="SPILL home">SP<span>I</span>LL</Link>
    <nav className="desktopNav" aria-label="Global navigation">
      <details className="navDropdown"><summary>Locations <span>⌄</span></summary><div className="dropdownPanel">
        {locations.map((location) => <Link key={location.slug} href={`/${location.slug}`}><span>{location.name}</span><small>{location.status === "open" ? "Open now" : "Coming soon"}</small></Link>)}
      </div></details>
      {globalNavigation.map((item) => <Link key={item.href} href={item.href}>{item.label}</Link>)}
    </nav>
    <div className="corporateNav"><Link href="/invest">Invest</Link><Link href="/franchise">Franchise</Link></div>
  </header>;
}
