import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { LocalHeader } from "@/components/local-header";
import { BrandedText } from "@/components/brand-text";
import { WaitlistForm } from "@/components/waitlist-form";
import { EventCard } from "@/components/event-card";
import { listUpcomingEvents } from "@/lib/events";
import { getLocation, locations } from "@/lib/site-data";

const homeSections = [
  { eyebrow: "Tonight at SPILL", title: "What’s happening tonight?", text: "The quickest view of tonight’s events, live moments, and reasons to come by.", href: "/saigon/whats-on#tonight", image: "/assets/spill/home/venue-night.jpg" },
  { eyebrow: "Coming up", title: "Plan the next night.", text: "See the week ahead across events, SPILL 42, performances, and creator formats.", href: "/saigon/whats-on#upcoming", image: "/assets/spill/home/common-area-poster.jpg" },
  { eyebrow: "Eat + Drink", title: "Coffee through cocktails.", text: "An all-day menu made for quick stops, long conversations, and everything between.", href: "/saigon/menu", image: "/assets/spill/menu/hero-poster.jpg" },
  { eyebrow: "SPILL 42", title: "Put the phones down.", text: "Forty-two prompts and four ways to connect in the room.", href: "/spill-42", image: "/assets/spill/home/spill-42-poster.jpg" },
  { eyebrow: "Create at SPILL", title: "Make something real.", text: "Podcast, livestream, confessional, perform, host, and collaborate.", href: "/saigon/create", image: "/assets/spill/home/podcast-poster.jpg" },
  { eyebrow: "Latest from SPILL", title: "Stories beyond the room.", text: "Catch new clips, conversations, highlights, and people from SPILL Saigon.", href: "/whats-on#highlights", image: "/assets/spill/home/people-founders-creators-professionals.png" },
  { eyebrow: "Visit SPILL Saigon", title: "Find your way in.", text: "Location, hours, directions, contact, accessibility, and house information.", href: "/saigon/visit", image: "/assets/spill/concept-exterior-day.webp" },
];

export function generateStaticParams() { return locations.map(({ slug }) => ({ location: slug })); }

export default async function LocationHome({ params }: { params: Promise<{ location: string }> }) {
  const { location: slug } = await params;
  const location = getLocation(slug);
  if (!location) notFound();
  if (location.status === "coming-soon") return <main className="comingSoon"><LocalHeader location={location} /><section><p className="eyebrow">Coming soon</p><h1><BrandedText text={location.name} /></h1><p>{location.strapline}</p><Link className="button primary" href="/partner">Bring SPILL to your market</Link></section></main>;

  const upcoming = await listUpcomingEvents({ locationSlug: location.slug, timeZone: location.timezone, limit: 3 });

  return <main><section className="hero localHero"><video className="localHeroMedia" autoPlay muted loop playsInline preload="metadata" poster="/assets/spill/home/hero-v2-poster.jpg" aria-hidden="true"><source src="/assets/spill/home/hero-v2.mp4" type="video/mp4" />Your browser does not support background video.</video><div className="localHeroVeil" /><LocalHeader location={location} /><div className="heroContent"><p className="eyebrow">Launching soon</p><h1><BrandedText text="SPILL Saigon" /></h1><p className="intro">Eat. Drink. Meet. Create.</p><div className="actions"><a className="button primary" href="#waitlist">Join the waitlist</a><Link className="button secondary" href={`/${slug}/whats-on`}>What’s on</Link></div></div><p className="heroNote">Good people · Brighter conversations</p></section>
    {upcoming.length > 0 && <section className="upcomingStrip" id="upcoming-events"><div className="upcomingStripHead"><div><p className="eyebrow">Coming up at {location.name}</p><h2>What’s on</h2></div><Link className="textLink" href={`/${slug}/whats-on`}>View all events <span>→</span></Link></div><div className="eventGrid">{upcoming.map((event) => <EventCard key={event.slug} event={event} />)}</div></section>}
    <section className="localDashboard localHomeSections">{homeSections.map((section, index) => <Link id={section.eyebrow.toLowerCase().replaceAll(" ", "-")} href={section.href} key={section.eyebrow}><Image src={section.image} alt="" fill sizes="(max-width: 980px) 100vw, 50vw" /><i aria-hidden="true" /><div><span>{String(index + 1).padStart(2, "0")} / {section.eyebrow}</span><h2>{section.title}</h2><p>{section.text}</p><b>Explore <strong>→</strong></b></div></Link>)}</section>
    <section className="visitStrip waitlistStrip"><div><p className="eyebrow">{location.name}</p><h2>The room is only<br />the beginning.</h2><p className="conceptNotice">Join the list for opening news, first events, creator opportunities, and booking access.</p></div><WaitlistForm locationSlug={location.slug} locationName={location.name} source={`${location.slug}-home`} /></section></main>;
}
