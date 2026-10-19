import Link from "next/link";
import Image from "next/image";
import { HoverDropdown } from "./hover-dropdown";
import {
  corporateNavigation,
  globalNavigation,
  locations,
  locationStatus,
} from "@/lib/site-data";
import { NavArrow } from "./nav-arrow";
import { MobileMenu, MobileNavGroup } from "./mobile-menu";
import { getLiveStatus } from "@/lib/live";

export async function GlobalHeader() {
  // SPILL Live joins the What's On menu once the first livestream has started.
  const { launched, liveNow } = await getLiveStatus();
  const liveLabel = liveNow ? "● Watch live now" : "Watch SPILL Live";
  const navigation = launched
    ? globalNavigation.map((item) =>
        item.href === "/whats-on"
          ? { ...item, items: [item.items[0], { label: liveLabel, href: "/live" }, ...item.items.slice(1)] }
          : item,
      )
    : globalNavigation;
  return (
    <header className="siteHeader">
      <Link className="brand brandLogo" href="/" aria-label="SPILL home">
        <Image
          src="/assets/spill/brand/wordmark-bright.png"
          alt="SPILL"
          width={1580}
          height={250}
          priority
        />
      </Link>
      <nav className="desktopNav" aria-label="Global navigation">
        <HoverDropdown
          className="navDropdown"
          label={
            <>
              Locations <span aria-hidden="true">⌄</span>
            </>
          }
        >
          <div className="dropdownPanel">
            {locations.map((location) => (
              <Link key={location.slug} href={`/${location.slug}`}>
                <span>{location.name}</span>
                <small>{locationStatus(location)}</small>
              </Link>
            ))}
            <span className="dropdownSoon">More locations coming</span>
          </div>
        </HoverDropdown>
        <Link href="/album">Album</Link>
        {navigation.map((item) => (
          <HoverDropdown
            className="navDropdown"
            key={item.href}
            label={item.label}
            href={item.href}
          >
            <div className="dropdownPanel">
              {item.items.map((child) => (
                <Link key={child.label} href={child.href}>
                  {child.label}
                  <NavArrow />
                </Link>
              ))}
            </div>
          </HoverDropdown>
        ))}
        <div className="corporateNav">
          {corporateNavigation.map((item) => (
            <Link key={item.href} href={item.href}>
              {item.label}
            </Link>
          ))}
        </div>
      </nav>
      <MobileMenu label="Open navigation">
        <nav aria-label="Mobile navigation">
          <p>Navigate SPILL</p>
          <Link href="/">
            SPILL Global
            <NavArrow />
          </Link>
          <Link href="/album">
            Album
            <NavArrow />
          </Link>
          <MobileNavGroup
            label="Locations"
            href="/#locations"
            overview="All locations"
            items={locations.map((location) => ({ label: location.name, href: `/${location.slug}`, note: locationStatus(location) }))}
          />
          {navigation.map((item) => (
            <MobileNavGroup key={item.href} label={item.label} href={item.href} items={item.items} />
          ))}
          {corporateNavigation.map((item) => (
            <Link key={item.href} href={item.href} className="mobileCorpLink">
              {item.label}
              <NavArrow />
            </Link>
          ))}
        </nav>
      </MobileMenu>
    </header>
  );
}
