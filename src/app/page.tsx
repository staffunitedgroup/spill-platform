import Link from "next/link";
import { GlobalHeader } from "@/components/global-header";
import { locations } from "@/lib/site-data";

const ecosystem = ["Eat + Drink", "Events", "SPILL 42", "Podcast", "Livestream", "Confessional", "Creators", "Community"];

export default function HomePage() {
  return <main>
    <section className="hero globalHero"><GlobalHeader /><div className="heroContent">
      <p className="eyebrow">The SPILL ecosystem</p><h1>Eat. Drink.<br /><em>Meet. Create.</em><br />SPILL.</h1>
      <p className="intro">A venue, media platform, and community built for real-world connection.</p>
      <div className="actions"><Link className="button primary" href="#locations">Choose your SPILL</Link><Link className="button secondary" href="/whats-on">See what’s on</Link></div>
    </div><div className="ecosystemRail">{ecosystem.map((item) => <span key={item}>{item}</span>)}</div></section>

    <section className="section locations" id="locations"><p className="eyebrow">Choose your SPILL</p>
      <div className="sectionHeading"><h2>One network.<br />Local energy.</h2><p>Every SPILL shares one idea while reflecting the people, rhythm, and culture of its city.</p></div>
      <div className="locationGrid">{locations.map((location, index) => <Link className={`locationCard ${location.status === "open" ? "active" : "muted"}`} href={`/${location.slug}`} key={location.slug}>
        <p>0{index + 1}</p><div><h3>{location.city}</h3><span>{location.status === "open" ? "Open now" : "Coming soon"}</span></div><b>{location.status === "open" ? "→" : "+"}</b>
      </Link>)}</div>
    </section>

    <section className="splitFeature"><article><p className="eyebrow">What happens at SPILL</p><h2>More than a café.<br />More than a bar.</h2><p>Food, drinks, live experiences, creators, conversations, and content—all connected in one place.</p><Link href="/about">Discover the concept →</Link></article>
      <article className="redPanel"><p className="eyebrow light">What’s on</p><h2>Something is always happening.</h2><p>Find tonight’s events, live sessions, SPILL 42 experiences, and what is coming next.</p><Link href="/whats-on">Explore the network →</Link></article>
    </section>

    <section className="spill42"><div className="sectionHeading"><div><p className="eyebrow">Signature experience</p><h2>SPILL 42</h2></div><p>Forty-two prompts. Four ways to connect. One table where phones stop being the most interesting thing in the room.</p></div>
      <div className="experienceGrid">{[["Ask","Thoughtful questions"],["Do","Playful challenges"],["Notice","Look around together"],["Dare","For the bold"]].map(([label,detail], index) => <article key={label}><span>0{index + 1}</span><h3>{label}</h3><p>{detail}</p></article>)}</div>
      <Link className="button primary" href="/spill-42">Try SPILL 42</Link>
    </section>

    <section className="networkSection"><p className="eyebrow">Built to grow</p><h2>The SPILL network</h2><div className="networkLinks"><Link href="/partner">For brands <span>→</span></Link><Link href="/invest">Invest <span>→</span></Link><Link href="/franchise">Franchise <span>→</span></Link></div></section>
  </main>;
}
