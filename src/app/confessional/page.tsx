import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { GlobalHeader } from "@/components/global-header";
import { ConfessionalAnimations } from "@/components/confessional-animations";
import { BrandedText, SpillWordmark } from "@/components/brand-text";

export const metadata: Metadata = {
  title: "SPILL Confessional — A Private Space to SPILL",
  description: "Step inside a private SPILL recording booth for honest stories, spontaneous moments, and conversations worth keeping.",
};

const modes = [
  ["Free Confession", "Say whatever is on your mind."],
  ["Answer a Question", "Choose from curated prompts."],
  ["Hot Take", "Share an opinion."],
  ["Tell a Story", "Respond to a theme."],
  ["Two-Person Mode", "Prompts for couples, friends, dates, family, or colleagues."],
  ["Private Mode", "Recording delivered only to the participant."],
  ["Shareable Mode", "Content prepared for social media."],
];
const boothFeatures = ["Compact two-person sofa", "Small table", "Ceiling-mounted microphone", "Two recessed ceiling lights", "Front-facing integrated key light", "Flat built-in display", "Discreet front-facing camera", "Table controls", "Acoustic treatment", "Quiet ventilation", "Privacy door", "Digital delivery"];
const launchMetrics = ["Sessions + peak times", "Solo vs two-person use", "Session length + pricing", "Prompted vs free-form", "Private, shared + repeat use", "F&B impact + reliability"];
const pricing = [
  ["SPILL Confessional", "129k–159k VND", "Recording + digital delivery"],
  ["Confessional Plus", "249k–349k VND", "More time, multiple takes, captions, editing, and social-ready clips"],
  ["Two-Person Confessional", "299k–449k VND", "A shared session for two"],
];
const consentChoices = [["Private", "Only they receive the recording."], ["Shareable", "Prepared for them to post."], ["SPILL Eligible", "SPILL may publish with permission."], ["Anonymous", "Identity can be protected."]];
const sponsorIdeas = ["Question of the Week", "Themed series", "Free public sessions", "Content activations"];
const eventUses = ["Weddings", "Corporate events", "Conferences", "Festivals", "Product launches", "Nightlife activations"];
const productCustomers = ["Hotels", "Malls", "Event companies", "Agencies", "Universities", "Entertainment venues"];
const software = ["Recording + prompts", "QR delivery + storage", "Consent management", "Branding + analytics", "Automated editing", "Captions + updates"];
const roadmap = ["Build + install two units", "Learn and expand inside SPILL", "Prove the economics", "Test events + one external unit", "Sell, lease, and license"];

export default function ConfessionalPage() {
  return <main className="confPage">
    <ConfessionalAnimations />
    <section className="confHero">
      <Image className="confHeroImage" src="/assets/spill/confessional/hero.png" alt="SPILL Confessional recording booths inside SPILL Saigon" fill loading="eager" sizes="100vw" />
      <div className="confHeroVeil" />
      <GlobalHeader />
      <div className="confHeroContent">
        <p className="confKicker">Private space · Professional recording · Your choice</p>
        <h1>Step in<br />Sit down<br /><em><SpillWordmark /></em></h1>
        <p>A private place inside SPILL where one or two people can sit down and say something real.</p>
        <strong>One person comfortably. Two people maximum.</strong>
        <div className="actions"><Link className="button primary" href="/create">Book a Confessional <span>↗</span></Link><a className="button secondary" href="#experience">See how it works</a></div>
      </div>
      <div className="confHeroRail"><span>Private by default</span><i>•</i><span>Share only by permission</span><i>•</i><span>Digital delivery</span></div>
    </section>

    <section className="confExperience" id="experience">
      <div className="confExperienceIntro" data-conf-reveal><p className="confKicker">01 / The Experience</p><h2>Designed to feel<br /><em>simple and private.</em></h2><p>The booth is designed for one person comfortably, two people maximum.</p></div>
      <div className="confSteps">{[["01", "Step in"], ["02", "Sit down"], ["03", "Choose a mode"], ["04", "Press record"], ["05", "SPILL"]].map(([number, label]) => <article key={label} data-conf-reveal><span>{number}</span><h3><BrandedText text={label} tone="dark" /></h3></article>)}</div>
      <div className="confExperienceMediaSplit" data-conf-reveal><div className="confExperienceVideo"><video autoPlay muted loop playsInline preload="metadata" poster="/assets/spill/confessional/promotion-poster.jpg" aria-label="SPILL Confessional experience"><source src="/assets/spill/confessional/promotion.mp4" type="video/mp4" />Your browser does not support embedded video.</video></div><div className="confExperienceDetails"><p className="confKicker">Inside</p><div className="confFeatureList">{boothFeatures.map((feature, index) => <span key={feature}><b>{String(index + 1).padStart(2, "0")}</b>{feature}</span>)}</div></div></div>
    </section>

    <section className="confModesSection" id="modes" aria-labelledby="conf-modes-heading">
      <div className="confModesHeading" data-conf-reveal><p className="confKicker">7 Modes</p><h2 id="conf-modes-heading">Choose how<br /><em>you want to SPILL.</em></h2><p>Start with a prompt, bring someone with you, keep the recording private, or prepare it to share.</p></div>
      <div className="confModesLayout"><div className="confModeGrid">{modes.map(([title, copy], index) => <article key={title} data-conf-reveal><span>{String(index + 1).padStart(2, "0")}</span><h3>{title}</h3><p>{copy}</p></article>)}</div><div className="confModesImage" data-conf-reveal><Image src="/assets/spill/confessional/modes-7.png" alt="Seven SPILL Confessional recording modes" fill sizes="(max-width: 820px) 100vw, 58vw" /></div></div>
    </section>

    <section className="confEcosystem" id="why-it-works">
      <div className="confEcosystemHeading" data-conf-reveal><p className="confKicker">02 / Why It Works Inside SPILL</p><h2>Visit. Stay.<br /><em>Participate. Return.</em></h2></div>
      <p className="confSectionLead" data-conf-reveal>SPILL Confessional gives people another reason to visit, stay, participate, and return.</p>
      <div className="confFormatCompare"><article className="confFormatFeature" data-conf-reveal><span>SPILL Podcast</span><h3>Long-form.</h3><p>Produced and deliberate.</p><Link href="/podcast">Explore Podcast →</Link><b className="confFormatArrow" aria-hidden="true">→</b></article><article data-conf-reveal><span>SPILL Livestream</span><h3>Public.</h3><p>Immediate and interactive.</p><Link href="/livestream">Explore Livestream →</Link><b className="confFormatArrow" aria-hidden="true">→</b></article><article className="active" data-conf-reveal><span>SPILL Confessional</span><h3>Private.</h3><p>Intimate and spontaneous.</p></article></div>
    </section>

    <section className="confLaunch">
      <div className="confLaunchIntro" data-conf-reveal><p className="confKicker">03 / Start Inside SPILL Saigon</p><h2>Start with two.<br /><em>Learn. Then expand.</em></h2></div>
      <div className="confLaunchColumns"><div className="confLaunchLeft" data-conf-reveal><p>The first phase focuses entirely on the venue. Start with two self-contained booths, then expand to approximately four once demand is proven. Each relocatable unit can move with events, traffic, seating, sponsorships, and operational needs.</p><div className="confLaunchNumbers"><div><strong>02</strong><span>Units at launch</span></div><b>→</b><div><strong>~04</strong><span>After demand is proven</span></div></div></div><div className="confLaunchRight"><p className="confLabLine" data-conf-reveal>The first booths become SPILL’s live R&amp;D lab.</p><div className="confMetricGrid">{launchMetrics.map((metric, index) => <article key={metric} data-conf-reveal><span>{String(index + 1).padStart(2, "0")}</span><h3>{metric}</h3></article>)}</div></div></div>
    </section>

    <section className="confRevenue" id="revenue">
      <div className="confRevenueHeading" data-conf-reveal><p className="confKicker">04 / Revenue Inside SPILL</p><h2>Simple to enter.<br /><em>Easy to upgrade.</em></h2><p>The entry session includes recording and digital delivery. Premium packages can add more time, multiple takes, captions, editing, and social-ready clips.</p></div>
      <div className="confPriceTable">{pricing.map(([product, price, detail], index) => <article key={product} data-conf-reveal><span>0{index + 1}</span><h3><BrandedText text={product} /></h3><strong>{price}</strong><p>{detail}</p></article>)}</div>
    </section>

    <section className="confFnbSection"><div className="confFnb" data-conf-reveal><div><p className="confKicker">05 / F&amp;B Integration</p><h2>The booth should grow<br /><em>the whole visit.</em></h2><p>Booth revenue, F&amp;B spend, content value, and future customer value become one connected experience.</p></div></div><div className="confSectionVisual" data-conf-reveal><Image src="/assets/spill/confessional/fnb-integration.png" alt="SPILL Confessional food and beverage integration journey" fill sizes="100vw" /></div></section>

    <section className="confAccess"><div className="confAccessHeading" data-conf-reveal><p className="confKicker">06 / Free Editorial Confessionals</p><h2>Not every strong story<br /><em>should be paid.</em></h2><p>Customers can pay. Interesting people can be invited. Sponsors can fund participation.</p></div><div className="confSectionVisual" data-conf-reveal><Image src="/assets/spill/confessional/free-editorial.png" alt="Customers, invited voices, and sponsors creating access to SPILL Confessional" fill sizes="100vw" /></div></section>

    <section className="confSponsors">
      <div className="confSponsorsIntro" data-conf-reveal><p className="confKicker">07 / Sponsorship</p><h2>Support the conversation.<br /><em>Never control it.</em></h2><p>Sponsorship can become one of the strongest revenue streams. SPILL owns the experience. The sponsor supports the conversation.</p></div>
      <div className="confSponsorIdeas">{sponsorIdeas.map((idea, index) => <article key={idea} data-conf-reveal><span>{String(index + 1).padStart(2, "0")}</span><h3>{idea}</h3></article>)}</div>
    </section>

    <section className="confContent"><div className="confContentHeading" data-conf-reveal><p className="confKicker">08 / Content Engine</p><h2>One honest moment.<br /><em>Many ways to travel.</em></h2><p>With participant permission, selected recordings can become clips, recurring formats, and stories that travel far beyond the booth.</p></div><div className="confSectionVisual" data-conf-reveal><Image src="/assets/spill/confessional/content-engine.png" alt="How one SPILL Confessional recording becomes social content and recurring formats" fill sizes="100vw" /></div></section>

    <section className="confPrivacy">
      <div className="confPrivacyIntro" data-conf-reveal><p className="confKicker">09 / Privacy and Consent</p><h2>Say something real.<br /><em>Keep the choice.</em></h2><p>Privacy is central to the concept. Trust is essential if people are expected to say anything meaningful.</p></div>
      <div className="confConsentGrid">{consentChoices.map(([title, copy], index) => <article key={title} data-conf-reveal><span>0{index + 1}</span><h3><BrandedText text={title} tone="dark" /></h3><p>{copy}</p></article>)}</div>
      <strong className="confTrustLine" data-conf-reveal>Private by default. Published only with permission.</strong>
    </section>

    <section className="confBoothSection">
      <div className="confBooth"><div className="confBoothMedia" data-conf-reveal><Image src="/assets/spill/confessional/hero.png" alt="Self-contained SPILL Confessional booth in the café-bar" fill sizes="(max-width: 900px) 100vw, 58vw" /></div><div className="confBoothCopy" data-conf-reveal><p className="confKicker">10 / The Booth</p><h2>Architecture.<br /><em>Not a studio.</em></h2><p>One side holds a two-person sofa. Opposite it, a flush-mounted display, discreet camera, and professional light face the speakers. A small table sits in the centre, with one hanging microphone and two recessed lights overhead. Table controls handle record, stop, lighting, retake, and end session.</p><p>No technical clutter. The unit should feel like a premium piece of furniture or architecture rather than a studio.</p></div></div>
      <div className="confRelocatable"><div className="confRelocatableCopy" data-conf-reveal><p className="confKicker">Self-contained and relocatable</p><h2>Power + internet.<br /><em><SpillWordmark /> anywhere.</em></h2><p>Each booth is a complete unit. Move it around SPILL, take it to events, relocate it between properties, or eventually install it in other venues.</p></div><div className="confRelocatableMedia" data-conf-reveal><Image src="/assets/spill/confessional/self-contained-relocatable.png" alt="A self-contained SPILL Confessional booth moving between locations and events" fill sizes="(max-width: 820px) 100vw, 52vw" /></div></div>
      <div className="confExternal"><div className="confExternalHeading" data-conf-reveal><p className="confKicker">Phase Two / Outside SPILL</p><h2>Prove it inside.<br /><em>Then test one outside.</em></h2><p>Only after the internal model is proven should SPILL test one external unit at an event, hotel, university, mall, or partner venue.</p></div><div className="confBigQuestion" data-conf-reveal><span>The key question</span><p>Does the Confessional work because it is inside SPILL, or can it attract demand independently?</p></div></div>
    </section>

    <section className="confEvents">
      <div className="confEventsIntro" data-conf-reveal><p className="confKicker">11 / Events</p><h2>Move the booth.<br /><em>Change the prompt.</em></h2><p>Because the booths are relocatable, they can become an event product for weddings, corporate events, conferences, festivals, launches, universities, hotels, and nightlife activations.</p></div>
      <div className="confEventUsesRail" data-conf-reveal>{eventUses.map((item) => <span key={item}>{item}</span>)}</div>
      <div className="confEventPricing" data-conf-reveal><div><span>Half-day</span><strong>8–15m VND</strong></div><div><span>Full-day</span><strong>15–30m VND</strong></div><div><span>Branded activation</span><strong>25–75m+ VND</strong></div></div>
    </section>

    <section className="confProduct">
      <div className="confProductHeading" data-conf-reveal><p className="confKicker">12 / Selling the Product</p><h2>Hardware + recurring software.<br /><em>Not simply the box.</em></h2><p>Once thoroughly tested, SPILL can manufacture and sell unbranded versions to third parties.</p></div>
      <div className="confCustomerCloud" data-conf-reveal>{productCustomers.map((item) => <span key={item}>{item}</span>)}</div>
      <div className="confSoftwareGrid">{software.map((item, index) => <article key={item} data-conf-reveal><span>{String(index + 1).padStart(2, "0")}</span><h3>{item}</h3></article>)}</div>
    </section>

    <section className="confFuture">
      <div className="confNetwork"><div className="confNetworkIntro" data-conf-reveal><p className="confKicker">Long-term network</p><h2>Stories across cities.<br /><em>One distributed media system.</em></h2><p>The network creates stories and personalities. The content grows the audience. The audience makes the network more valuable.</p></div><div className="confCities" data-conf-reveal>{["Saigon", "Bangkok", "Tokyo", "Singapore"].map((city, index) => <div key={city}><span>0{index + 1}</span><h3><SpillWordmark /> {city}</h3>{index < 3 && <b>→</b>}</div>)}</div></div>
      <div className="confRoadmap"><div className="confRoadmapHeading" data-conf-reveal><p className="confKicker">Roadmap</p><h2>Begin intimate.<br /><em>Build the network.</em></h2></div><div className="confRoadmapGrid">{roadmap.map((step, index) => <article key={step} data-conf-reveal><span>{String(index + 1).padStart(2, "0")}</span><h3><BrandedText text={step} tone="dark" /></h3>{index < roadmap.length - 1 && <b>→</b>}</article>)}</div></div>
      <div className="confBigger"><Image src="/assets/spill/confessional/hero.png" alt="" fill sizes="100vw" /><div className="confBiggerVeil" /><div data-conf-reveal><p className="confKicker">The bigger opportunity</p><h2>A private place<br /><em>to say something real.</em></h2><p>Then an experience + revenue source + content engine + customer acquisition tool + sponsorship platform + event product + creator discovery channel + hardware product + software business + physical media network.</p><strong>SPILL CONFESSIONAL<br />Step in. Sit down. SPILL.</strong><div className="actions"><Link className="button primary" href="/create">Book a Confessional</Link><Link className="button secondary" href="/partner">Bring Confessional to an event</Link></div></div></div>
    </section>
  </main>;
}
