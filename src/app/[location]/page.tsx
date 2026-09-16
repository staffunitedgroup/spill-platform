import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { LocalHeader } from "@/components/local-header";
import { getLocation, locations, socialLinks } from "@/lib/site-data";

const conceptVisuals = [
  { src: "/assets/spill/concept-exterior-day.webp", alt: "Daytime exterior concept for SPILL Saigon", label: "The venue", detail: "A future home for coffee, culture, and conversation." },
  { src: "/assets/spill/concept-menu.webp", alt: "SPILL Saigon concept food and drink menu", label: "Eat + drink", detail: "An all-day menu designed to move from coffee into cocktails." },
  { src: "/assets/spill/concept-spill42.webp", alt: "SPILL 42 selection menu concept", label: "SPILL 42", detail: "Forty-two prompts and four ways to connect." },
  { src: "/assets/spill/concept-confessional.webp", alt: "SPILL Confessional booth concept", label: "Create", detail: "A space for stories, podcasts, livestreams, and creators." },
];

export function generateStaticParams() { return locations.map(({ slug }) => ({ location: slug })); }

export default async function LocationHome({ params }: { params: Promise<{ location: string }> }) {
  const { location: slug } = await params;
  const location = getLocation(slug);
  if (!location) notFound();
  if (location.status === "coming-soon") return <main className="comingSoon"><LocalHeader location={location} /><section><p className="eyebrow">Coming soon</p><h1>{location.name}</h1><p>{location.strapline}</p><Link className="button primary" href="/partner">Bring SPILL to your market</Link></section></main>;

  return <main><section className="hero localHero"><LocalHeader location={location} /><div className="heroContent"><p className="eyebrow">{location.name} · Coming soon</p><h1>Eat. Drink.<br /><em>Meet. Create.</em></h1><div className="actions"><a className="button primary" href="mailto:hello@spillcafebar.com?subject=Join%20the%20SPILL%20Saigon%20waitlist">Join the waitlist</a><Link className="button secondary" href={`/${slug}/whats-on`}>Explore the concept</Link></div></div><p className="heroNote">Launching soon · Saigon</p></section>
    <section className="conceptGallery" aria-labelledby="concept-heading"><div className="conceptGalleryIntro"><p className="eyebrow">A first look</p><h2 id="concept-heading">The SPILL Saigon vision.</h2><p>These early concept visuals show the experience we are building. The final venue and offering may evolve as launch approaches.</p></div><div className="conceptGrid">{conceptVisuals.map((visual, index) => <article className={index === 0 ? "conceptCard conceptCardWide" : "conceptCard"} key={visual.label}><div className="conceptImage"><Image src={visual.src} alt={visual.alt} fill sizes={index === 0 ? "(max-width: 900px) 100vw, 66vw" : "(max-width: 900px) 100vw, 33vw"} /></div><div><span>0{index + 1}</span><h3>{visual.label}</h3><p>{visual.detail}</p></div></article>)}</div></section>
    <section className="localDashboard"><Link href={`/${slug}/whats-on`}><span>Planned experiences</span><h2>See what’s coming.</h2><b>Explore the vision →</b></Link><Link href={`/${slug}/menu`}><span>Eat + Drink</span><h2>Concept menu.</h2><b>Preview the menu →</b></Link><Link href={`/${slug}/spill42`}><span>SPILL 42</span><h2>Put the phones down.</h2><b>Discover the concept →</b></Link><Link href={`/${slug}/create`}><span>Create</span><h2>Make it at SPILL.</h2><b>Register interest →</b></Link></section>
    <section className="socialBand"><div><p className="eyebrow">Follow the build</p><h2>@spillsaigon</h2><p>Launch updates, concept reveals, creator opportunities, and the road to opening.</p></div><div>{socialLinks.map((social) => <a href={social.href} target="_blank" rel="noreferrer" key={social.label}>{social.label}<span>↗</span></a>)}</div></section>
    <section className="visitStrip"><div><p className="eyebrow">Discover SPILL Saigon</p><h2>Good people.<br />Great stories.</h2><p className="conceptNotice">Concept visuals represent the planned SPILL Saigon experience. Final venue details may evolve.</p></div><a className="button primary" href="mailto:hello@spillcafebar.com?subject=SPILL%20Saigon%20launch%20updates">Get launch updates</a></section></main>;
}
