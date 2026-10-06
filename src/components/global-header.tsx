import { Fragment } from "react";
import Link from "next/link";
import Image from "next/image";
import { HoverDropdown } from "./hover-dropdown";
import {
  SPILL42_PLAY_HREF,
  corporateNavigation,
  globalNavigation,
  locations,
  locationStatus,
} from "@/lib/site-data";
import { NavArrow } from "./nav-arrow";
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
          summary={
            <>
              Locations <span>⌄</span>
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
            summary={
              <>
                <Link href={item.href}>{item.label}</Link> <span>⌄</span>
              </>
            }
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
      <details className="mobileMenu">
        <summary aria-label="Open navigation">
          <span />
          <span />
        </summary>
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
          <Link href="/#locations">
            Locations
            <NavArrow direction="down" />
          </Link>
          {navigation.map((item) => (
            <Fragment key={item.href}>
              <Link href={item.href}>
                {item.label}
                <NavArrow />
              </Link>
              {/* Mobile has no hover dropdown, so surface SPILL 42 directly. */}
              {item.href === "/whats-on" && (
                <Link href={SPILL42_PLAY_HREF} className="mobileSpill42">
                  Play SPILL 42
                  <NavArrow />
                </Link>
              )}
              {item.href === "/whats-on" && launched && (
                <Link href="/live" className="mobileSpill42">
                  {liveLabel}
                  <NavArrow />
                </Link>
              )}
            </Fragment>
          ))}
          {corporateNavigation.map((item) => (
            <Link key={item.href} href={item.href} className="mobileCorpLink">
              {item.label}
              <NavArrow />
            </Link>
          ))}
        </nav>
      </details>
    </header>
  );
}
