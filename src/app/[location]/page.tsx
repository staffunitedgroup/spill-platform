import Link from "next/link";
import { notFound } from "next/navigation";
import { LocalHeader } from "@/components/local-header";
import { BrandedText } from "@/components/brand-text";
import { getLocation, locations } from "@/lib/site-data";

const homeSections = [
  { eyebrow: "Tonight at SPILL", title: "What’s happening tonight?", text: "The quickest view of tonight’s events, live moments, and reasons to come by.", href: "/saigon/whats-on#tonight" },
  { eyebrow: "Coming up", title: "Plan the next night.", text: "See the week ahead across events, SPILL 42, performances, and creator formats.", href: "/saigon/whats-on#upcoming" },
  { eyebrow: "Eat + Drink", title: "Coffee through cocktails.", text: "An all-day menu made for quick stops, long conversations, and everything between.", href: "/saigon/menu" },
  { eyebrow: "SPILL 42", title: "Put the phones down.", text: "Forty-two prompts and four ways to connect in the room.", href: "/saigon/spill42" },
  { eyebrow: "Create at SPILL", title: "Make something real.", text: "Podcast, livestream, confessional, perform, host, and collaborate.", href: "/saigon/create" },
  { eyebrow: "Latest from SPILL", title: "Stories beyond the room.", text: "Catch new clips, conversations, highlights, and people from SPILL Saigon.", href: "/whats-on#highlights" },
  { eyebrow: "Visit SPILL Saigon", title: "Find your way in.", text: "Location, hours, directions, contact, accessibility, and house information.", href: "/saigon/visit" },
];

export function generateStaticParams() { return locations.map(({ slug }) => ({ location: slug })); }

export default async function LocationHome({ params }: { params: Promise<{ location: string }> }) {
  const { location: slug } = await params;
  const location = getLocation(slug);
  if (!location) notFound();
  if (location.status === "coming-soon") return <main className="comingSoon"><LocalHeader location={location} /><section><p className="eyebrow">Coming soon</p><h1><BrandedText text={location.name} /></h1><p>{location.strapline}</p><Link className="button primary" href="/partner">Bring SPILL to your market</Link></section></main>;

  return <main><section className="hero localHero"><video className="localHeroMedia" autoPlay muted loop playsInline preload="metadata" poster="/assets/spill/home/hero-v2-poster.jpg" aria-hidden="true"><source src="/assets/spill/home/hero-v2.mp4" type="video/mp4" />Your browser does not support background video.</video><div className="localHeroVeil" /><LocalHeader location={location} /><div className="heroContent"><p className="eyebrow">Launching soon</p><h1><BrandedText text="SPILL Saigon" /></h1><p className="intro">Eat. Drink. Meet. Create.</p><div className="actions"><a className="button primary" href="mailto:hello@spillcafebar.com?subject=Join%20the%20SPILL%20Saigon%20waitlist">Join the waitlist</a><Link className="button secondary" href={`/${slug}/whats-on`}>What’s on</Link></div></div><p className="heroNote">Good people · Brighter conversations</p></section>
    <section className="localDashboard localHomeSections">{homeSections.map((section, index) => <Link id={section.eyebrow.toLowerCase().replaceAll(" ", "-")} href={section.href} key={section.eyebrow}><span>{String(index + 1).padStart(2, "0")} / {section.eyebrow}</span><h2>{section.title}</h2><p>{section.text}</p><b>Explore →</b></Link>)}</section>
    <section className="visitStrip"><div><p className="eyebrow">SPILL Saigon</p><h2>The room is only<br />the beginning.</h2><p className="conceptNotice">Join the list for opening news, first events, creator opportunities, and booking access.</p></div><a className="button primary" href="mailto:hello@spillcafebar.com?subject=SPILL%20Saigon%20launch%20updates">Get launch updates</a></section></main>;
}
