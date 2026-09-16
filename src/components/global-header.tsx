import Link from "next/link";
import Image from "next/image";
import { globalNavigation, locations, locationStatus } from "@/lib/site-data";

export function GlobalHeader() {
  return <header className="siteHeader">
    <Link className="brand brandLogo" href="/" aria-label="SPILL home"><Image src="/assets/spill/logo-horizontal-bright.webp" alt="SPILL" width={900} height={300} priority /></Link>
    <nav className="desktopNav" aria-label="Global navigation">
      <details className="navDropdown"><summary>Locations <span>⌄</span></summary><div className="dropdownPanel">
        {locations.map((location) => <Link key={location.slug} href={`/${location.slug}`}><span>{location.name}</span><small>{locationStatus(location)}</small></Link>)}
      </div></details>
      {globalNavigation.map((item) => <Link key={item.href} href={item.href}>{item.label}</Link>)}
    </nav>
    <div className="corporateNav"><Link href="/invest">Invest</Link><Link href="/franchise">Franchise</Link></div>
  </header>;
}
