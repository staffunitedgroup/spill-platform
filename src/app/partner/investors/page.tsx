import Image from "next/image";
import Link from "next/link";
import { GlobalHeader } from "@/components/global-header";
import { MailInquiryForm } from "@/components/mail-inquiry-form";

const investorInterests = ["Investing in SPILL", "Strategic investment", "Market expansion", "Property / real estate partnership", "Requesting investor access", "Other"];

export default function Page() {
  return <main className="investorPage">
    <section className="investorHero"><Image src="/assets/spill/home/venue-night.jpg" alt="SPILL venue at night" fill priority sizes="100vw" /><div className="investorHeroVeil" /><GlobalHeader /><div><p className="eyebrow">Partner with SPILL · Investors</p><h1>Invest in the<br /><em>ecosystem.</em></h1><p>SPILL connects hospitality, experiences, creators, content, community, and commercial partnerships through one platform designed to travel.</p></div></section>
    <section className="investorPriority" id="investor-enquiry"><div className="investorPriorityIntro"><p className="eyebrow">Start here</p><h2>A conversation<br />before a <em>deck.</em></h2><p>Tell us what interests you and where you may add value. The SPILL team will respond directly and can provide access to appropriate confidential materials.</p><Link className="investorAccessCard" href="/partner/investors/overview"><span>Restricted access</span><strong>Investor overview</strong><small>Already have the password? Open the secure overview →</small></Link></div><MailInquiryForm formTitle="Investor enquiry" interests={investorInterests} subject="SPILL investor enquiry" investor /></section>
    <section className="investorVisual"><Image src="/assets/spill/home/ecosystem-streaming.png" alt="SPILL content and streaming ecosystem" fill sizes="(max-width: 900px) 100vw, 50vw" /><div><p className="eyebrow">One connected platform</p><h2>Physical energy.<br /><em>Digital reach.</em></h2><p>The public proposition is simple: the venue creates experiences; experiences create stories; stories grow audiences and bring new people back to SPILL.</p></div></section>
    <section className="investorLater"><p className="eyebrow">Explore after the introduction</p><div>{[["01", "Business model", "Multiple connected revenue streams across hospitality, experiences, media, partnerships, and expansion."], ["02", "SPILL ecosystem", "A repeatable system where the room, creators, programming, content, and audience reinforce one another."], ["03", "Expansion strategy", "A global platform designed to preserve a distinct local personality in every market."]].map(([number, title, text]) => <article key={title}><span>{number}</span><h3>{title}</h3><p>{text}</p></article>)}</div></section>
  </main>;
}
