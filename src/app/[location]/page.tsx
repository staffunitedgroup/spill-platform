import Link from "next/link";
import { notFound } from "next/navigation";
import { LocalHeader } from "@/components/local-header";
import { getLocation, locations } from "@/lib/site-data";

export function generateStaticParams() { return locations.map(({ slug }) => ({ location: slug })); }

export default async function LocationHome({ params }: { params: Promise<{ location: string }> }) {
  const { location: slug } = await params;
  const location = getLocation(slug);
  if (!location) notFound();
  if (location.status === "coming-soon") return <main className="comingSoon"><LocalHeader location={location} /><section><p className="eyebrow">Coming soon</p><h1>{location.name}</h1><p>{location.strapline}</p><Link className="button primary" href="/partner">Bring SPILL to your market</Link></section></main>;

  return <main><section className="hero localHero"><LocalHeader location={location} /><div className="heroContent"><p className="eyebrow">{location.name}</p><h1>Eat. Drink.<br /><em>Meet. Create.</em></h1><div className="actions"><Link className="button primary" href={`/${slug}/whats-on`}>Tonight at SPILL</Link><Link className="button secondary" href={`/${slug}/book`}>Book</Link></div></div><p className="heroNote">Open now · Saigon</p></section>
    <section className="localDashboard"><Link href={`/${slug}/whats-on`}><span>Tonight</span><h2>What’s happening?</h2><b>View events →</b></Link><Link href={`/${slug}/menu`}><span>Eat + Drink</span><h2>All day into late.</h2><b>Explore the menu →</b></Link><Link href={`/${slug}/spill42`}><span>SPILL 42</span><h2>Put the phones down.</h2><b>Start connecting →</b></Link><Link href={`/${slug}/create`}><span>Create</span><h2>Make it at SPILL.</h2><b>See opportunities →</b></Link></section>
    <section className="visitStrip"><div><p className="eyebrow">Visit SPILL Saigon</p><h2>Good people.<br />Great stories.</h2></div><Link className="button primary" href={`/${slug}/visit`}>Plan your visit</Link></section></main>;
}
