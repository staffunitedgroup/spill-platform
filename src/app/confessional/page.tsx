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
const launchMetrics = ["Sessions per day", "Peak usage times", "Solo vs two-person usage", "Ideal session length", "Pricing tolerance", "Free-form vs prompted usage", "Retake frequency", "Private vs shareable recordings", "Social sharing rates", "Repeat usage", "Editing demand", "Staff involvement", "Cleaning and maintenance", "Equipment reliability", "Sound isolation", "Camera framing", "Lighting quality", "F&B spend before and after use"];
const pricing = [
  ["SPILL Confessional", "129k–159k VND", "Recording + digital delivery"],
  ["Confessional Plus", "249k–349k VND", "More time, multiple takes, captions, editing, and social-ready clips"],
  ["Two-Person Confessional", "299k–449k VND", "A shared session for two"],
];
const consentChoices = [["Private", "Only they receive the recording."], ["Shareable", "Prepared for them to post."], ["SPILL Eligible", "SPILL may publish with permission."], ["Anonymous", "Identity can be protected."]];
const sponsorIdeas = ["Question of the Week", "Themed Confessional series", "Free public sessions", "Branded intro / outro", "Content campaigns", "Giveaways", "Special activations"];
const contentOutputs = ["TikToks", "Reels", "YouTube Shorts", "Facebook clips", "Quote cards", "Compilations"];
const recurringFormats = ["The Saigon Confession", "Dating Confessions", "Unpopular Opinion", "Things I Never Said Out Loud", "My Biggest Mistake", "Why I Came to Saigon", "Before I Leave Vietnam", "Confession of the Week"];
const externalLocations = ["Shopping mall", "Hotel", "University", "Entertainment venue", "Partner café / bar", "Coworking space", "Airport environment", "Event"];
const eventUses = ["Weddings", "Corporate events", "Conferences", "Festivals", "Product launches", "Universities", "Hotels", "Nightlife activations"];
const productCustomers = ["Hotels", "Malls", "Event companies", "Agencies", "Universities", "Corporations", "Entertainment venues", "Tourism operators", "Retailers"];
const software = ["Recording", "Prompt management", "QR delivery", "Cloud storage", "Consent management", "Branding", "Analytics", "Remote diagnostics", "Automated editing", "Captions", "Content management", "Software updates"];
const corporateUses = ["Customer testimonials", "Employee stories", "Market research", "Visitor feedback", "Recruitment", "Internal culture programs", "Event feedback"];
const roadmap = ["Build prototype", "Install 2 units inside SPILL", "Learn and optimize", "Expand to ~4 units", "Prove economics", "Test 1 external unit", "Build a small Saigon network", "Introduce event rentals", "Develop commercial hardware", "Sell, lease, and license units"];

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
      <div className="confExperienceBooth" data-conf-reveal>
        <div className="confExperienceBoothMedia"><video autoPlay muted loop playsInline preload="metadata" poster="/assets/spill/confessional/promotion-poster.jpg" aria-label="SPILL Confessional experience"><source src="/assets/spill/confessional/promotion.mp4" type="video/mp4" />Your browser does not support embedded video.</video></div>
        <div className="confExperienceBoothCopy"><p className="confKicker">Inside</p><div className="confFeatureList">{boothFeatures.map((feature, index) => <span key={feature}><b>{String(index + 1).padStart(2, "0")}</b>{feature}</span>)}</div></div>
      </div>
      <div className="confModeGrid">{modes.map(([title, copy], index) => <article key={title} data-conf-reveal><span>{String(index + 1).padStart(2, "0")}</span><h3>{title}</h3><p>{copy}</p></article>)}</div>
    </section>

    <section className="confEcosystem">
      <div className="confEcosystemHeading" data-conf-reveal><p className="confKicker">02 / Why It Works Inside SPILL</p><h2>Visit. Stay.<br /><em>Participate. Return.</em></h2></div>
      <p className="confSectionLead" data-conf-reveal>SPILL Confessional gives people another reason to visit, stay, participate, and return.</p>
      <div className="confFormatCompare"><article data-conf-reveal><span>SPILL Podcast</span><h3>Long-form.</h3><p>Produced and deliberate.</p><Link href="/podcast">Explore Podcast →</Link></article><article data-conf-reveal><span>SPILL Livestream</span><h3>Public.</h3><p>Immediate and interactive.</p><Link href="/livestream">Explore Livestream →</Link></article><article className="active" data-conf-reveal><span>SPILL Confessional</span><h3>Private.</h3><p>Intimate and spontaneous.</p></article></div>
      <div className="confDiscoveryPath" data-conf-reveal><span>Confessional</span><b>→</b><span>Livestream</span><b>→</b><span>Podcast</span><p>A great Confessional can reveal a personality, story, creator, or idea worth developing further.</p></div>
    </section>

    <section className="confLaunch">
      <div className="confLaunchIntro" data-conf-reveal><p className="confKicker">03 / Start Inside SPILL Saigon</p><h2>Start with two.<br /><em>Learn. Then expand.</em></h2><p>The first phase focuses entirely on the venue. Start with two self-contained booths, then expand to approximately four once demand is proven. Each relocatable unit can move with events, traffic, seating, sponsorships, and operational needs.</p></div>
      <div className="confLaunchNumbers" data-conf-reveal><div><strong>02</strong><span>Units at launch</span></div><b>→</b><div><strong>~04</strong><span>After demand is proven</span></div></div>
      <p className="confLabLine" data-conf-reveal>The first booths become SPILL’s live R&amp;D lab.</p>
      <div className="confLaunchVisual" data-conf-reveal><Image src="/assets/spill/home/venue-night.jpg" alt="SPILL Saigon operating as a live testing ground for the Confessional" fill sizes="100vw" /></div>
      <div className="confMetricGrid">{launchMetrics.map((metric, index) => <article key={metric} data-conf-reveal><span>{String(index + 1).padStart(2, "0")}</span><h3>{metric}</h3></article>)}</div>
    </section>

    <section className="confRevenue">
      <div className="confRevenueHeading" data-conf-reveal><p className="confKicker">04 / Revenue Inside SPILL</p><h2>Simple to enter.<br /><em>Easy to upgrade.</em></h2><p>The entry session includes recording and digital delivery. Premium packages can add more time, multiple takes, captions, editing, and social-ready clips.</p></div>
      <div className="confPriceTable">{pricing.map(([product, price, detail], index) => <article key={product} data-conf-reveal><span>0{index + 1}</span><h3><BrandedText text={product} /></h3><strong>{price}</strong><p>{detail}</p></article>)}</div>
    </section>

    <section className="confFnbSection"><div className="confFnb" data-conf-reveal><div><p className="confKicker">05 / F&amp;B Integration</p><h2>The booth should grow<br /><em>the whole visit.</em></h2><p>The true value of each customer becomes:</p><h3>Booth revenue + F&amp;B spend + content value + future customer value</h3></div><ul><li>Spend 300k VND and unlock a Confessional session</li><li>Confessional + Cocktail package</li><li>Preferred drink pricing after a session</li><li>Sponsored free sessions during selected periods</li></ul></div></section>

    <section className="confAccess">
      <div className="confAccessHeading" data-conf-reveal><p className="confKicker">06 / Free Editorial Confessionals</p><h2>Not every strong story<br /><em>should be paid.</em></h2><p>SPILL should invite interesting people to participate for free: creators, musicians, artists, founders, travelers, performers, local personalities, and compelling regular customers.</p></div>
      <div className="confAccessGrid"><article data-conf-reveal><span>01 / Customers</span><h3>Can pay.</h3><p>Anyone can book a low-friction session and leave with something real.</p><Link href="/create">Book a session →</Link></article><article data-conf-reveal><span>02 / Interesting people</span><h3>Can be invited.</h3><p>Editorial invitations uncover voices and stories worth developing.</p></article><article data-conf-reveal><span>03 / Sponsors</span><h3>Can fund participation.</h3><p>Partners widen access while SPILL protects the integrity of the experience.</p><Link href="/partner">Partner with SPILL →</Link></article></div>
    </section>

    <section className="confSponsors">
      <div className="confSponsorsIntro" data-conf-reveal><p className="confKicker">07 / Sponsorship</p><h2>Support the conversation.<br /><em>Never control it.</em></h2><p>Sponsorship can become one of the strongest revenue streams. SPILL owns the experience. The sponsor supports the conversation.</p></div>
      <div className="confSponsorIdeas">{sponsorIdeas.map((idea, index) => <article key={idea} data-conf-reveal><span>{String(index + 1).padStart(2, "0")}</span><h3>{idea}</h3></article>)}</div>
      <div className="confPromptWall" data-conf-reveal><span>Example prompts</span><blockquote>“What is the biggest risk you have ever taken?”</blockquote><blockquote>“Tell us your worst first date.”</blockquote><blockquote>“What would you do with one extra day in Saigon?”</blockquote></div>
    </section>

    <section className="confContent">
      <div className="confContentHeading" data-conf-reveal><p className="confKicker">08 / Content Engine</p><h2>One honest moment.<br /><em>Many ways to travel.</em></h2><p>With participant permission, selected recordings become a continuous stream of authentic content without requiring SPILL to produce every piece from scratch.</p></div>
      <div className="confContentVisual" data-conf-reveal><Image src="/assets/spill/home/ecosystem-content.png" alt="SPILL stories moving from the venue into social content" fill sizes="100vw" /><div>{contentOutputs.map((item) => <span key={item}>{item}</span>)}</div></div>
      <div className="confSeries" data-conf-reveal><h3>Recurring formats</h3><div>{recurringFormats.map((format) => <span key={format}>{format}</span>)}</div></div>
    </section>

    <section className="confPrivacy">
      <div className="confPrivacyIntro" data-conf-reveal><p className="confKicker">09 / Privacy and Consent</p><h2>Say something real.<br /><em>Keep the choice.</em></h2><p>Privacy is central to the concept. Trust is essential if people are expected to say anything meaningful.</p></div>
      <div className="confConsentGrid">{consentChoices.map(([title, copy], index) => <article key={title} data-conf-reveal><span>0{index + 1}</span><h3><BrandedText text={title} /></h3><p>{copy}</p></article>)}</div>
      <strong className="confTrustLine" data-conf-reveal>Private by default. Published only with permission.</strong>
    </section>

    <section className="confBoothSection">
      <div className="confBooth"><div className="confBoothMedia" data-conf-reveal><Image src="/assets/spill/confessional/hero.png" alt="Self-contained SPILL Confessional booth in the café-bar" fill sizes="(max-width: 900px) 100vw, 58vw" /></div><div className="confBoothCopy" data-conf-reveal><p className="confKicker">10 / The Booth</p><h2>Architecture.<br /><em>Not a studio.</em></h2><p>One side holds a two-person sofa. Opposite it, a flush-mounted display, discreet camera, and professional light face the speakers. A small table sits in the centre, with one hanging microphone and two recessed lights overhead. Table controls handle record, stop, lighting, retake, and end session.</p><p>No technical clutter. The unit should feel like a premium piece of furniture or architecture rather than a studio.</p></div></div>
      <div className="confRelocatable"><div className="confRelocatableCopy" data-conf-reveal><p className="confKicker">Self-contained and relocatable</p><h2>Power + internet.<br /><em><SpillWordmark /> anywhere.</em></h2><p>Each booth is a complete unit. Move it around SPILL, take it to events, relocate it between properties, or eventually install it in other venues.</p></div><div className="confRequirements" data-conf-reveal><span>Requires little more than</span><div><strong>01</strong><h3>Power</h3></div><b>+</b><div><strong>02</strong><h3>Internet</h3></div></div></div>
      <div className="confExternal"><div className="confExternalHeading" data-conf-reveal><p className="confKicker">Phase Two / Outside SPILL</p><h2>Prove it inside.<br /><em>Then test one outside.</em></h2><p>Only after the internal model is proven should SPILL test one external unit. If it performs well, the standalone opportunity is proven.</p></div><div className="confExternalGrid">{externalLocations.map((location, index) => <article key={location} data-conf-reveal><span>{String(index + 1).padStart(2, "0")}</span><h3>{location}</h3></article>)}</div><div className="confBigQuestion" data-conf-reveal><span>The key question</span><p>Does the Confessional work because it is inside SPILL, or can it attract demand independently?</p></div></div>
    </section>

    <section className="confCityNetwork"><div data-conf-reveal><p className="confKicker">11 / SPILL Confessionals Around Saigon</p><h2>A city network.<br /><em>Every booth points home.</em></h2></div><div className="confCityMessage" data-conf-reveal><p>Each SPILL-branded unit becomes both a revenue source and a physical SPILL advertisement.</p><blockquote>Thanks for SPILLing.<br />Visit SPILL Saigon and show this QR for a preferred drink offer.</blockquote><p>Every external unit becomes a customer-acquisition channel for the wider ecosystem.</p></div></section>

    <section className="confEvents">
      <div className="confEventsIntro" data-conf-reveal><p className="confKicker">12 / Events</p><h2>Move the booth.<br /><em>Change the prompt.</em></h2><p>Because the booths are relocatable, they can become an event product for weddings, corporate events, conferences, festivals, launches, universities, hotels, and nightlife activations.</p></div>
      <div className="confEventGrid">{eventUses.map((item, index) => <article key={item} data-conf-reveal><span>0{index + 1}</span><h3>{item}</h3></article>)}</div>
      <div className="confEventPrompts" data-conf-reveal><p><strong>Wedding</strong> “Tell the couple something they should watch in ten years.”</p><p><strong>Company</strong> “What should this company do differently next year?”</p><p><strong>Conference</strong> “What is the biggest idea you are taking away today?”</p></div>
      <div className="confEventPricing" data-conf-reveal><div><span>Half-day</span><strong>8–15m VND</strong></div><div><span>Full-day</span><strong>15–30m VND</strong></div><div><span>Branded activation</span><strong>25–75m+ VND</strong></div></div>
    </section>

    <section className="confProduct">
      <div className="confProductHeading" data-conf-reveal><p className="confKicker">13 / Selling the Product</p><h2>Hardware + recurring software.<br /><em>Not simply the box.</em></h2><p>Once thoroughly tested, SPILL can manufacture and sell unbranded versions to third parties.</p></div>
      <div className="confProductVisual" data-conf-reveal><Image src="/assets/spill/home/ecosystem-streaming.png" alt="SPILL content platform displayed across television, tablet, mobile, and laptop" fill sizes="100vw" /></div>
      <div className="confCustomerCloud" data-conf-reveal>{productCustomers.map((item) => <span key={item}>{item}</span>)}</div>
      <div className="confSoftwareGrid">{software.map((item, index) => <article key={item} data-conf-reveal><span>{String(index + 1).padStart(2, "0")}</span><h3>{item}</h3></article>)}</div>
    </section>

    <section className="confFuture">
      <div className="confFutureIntro" data-conf-reveal><p className="confKicker">14 / Future Product Family</p><h2>One core system.<br /><em>Many commercial lives.</em></h2><p>The units can be sold, leased, or placed on a revenue-share basis.</p></div>
      <div className="confProductFamily"><article data-conf-reveal><span>SPILL Confessional</span><h3>Network units</h3><p>SPILL-branded units across cities.</p></article><article data-conf-reveal><span>Confessional Pro</span><h3>Commercial units</h3><p>Unbranded systems for third parties.</p></article><article data-conf-reveal><span>Confessional Event</span><h3>Portable activations</h3><p>Built to travel, brand, and perform.</p></article></div>
      <div className="confCorporate"><div data-conf-reveal><p className="confKicker">Corporate video feedback</p><h2>The same booth.<br /><em>A new business tool.</em></h2><p>The core hardware can support another commercial use without changing its foundation.</p></div><div className="confCorporateUses" data-conf-reveal>{corporateUses.map((item) => <span key={item}>{item}</span>)}</div></div>
      <div className="confNetwork"><div className="confNetworkIntro" data-conf-reveal><p className="confKicker">Long-term network</p><h2>Stories across cities.<br /><em>One distributed media system.</em></h2><p>The network creates stories and personalities. The content grows the audience. The audience makes the network more valuable.</p></div><div className="confCities" data-conf-reveal>{["Saigon", "Bangkok", "Tokyo", "Singapore"].map((city, index) => <div key={city}><span>0{index + 1}</span><h3><SpillWordmark /> {city}</h3>{index < 3 && <b>→</b>}</div>)}</div></div>
      <div className="confRoadmap"><div className="confRoadmapHeading" data-conf-reveal><p className="confKicker">Roadmap</p><h2>Begin intimate.<br /><em>Build the network.</em></h2></div><div className="confRoadmapGrid">{roadmap.map((step, index) => <article key={step} data-conf-reveal><span>{String(index + 1).padStart(2, "0")}</span><h3><BrandedText text={step} tone="dark" /></h3>{index < roadmap.length - 1 && <b>→</b>}</article>)}</div></div>
      <div className="confBigger"><Image src="/assets/spill/confessional/hero.png" alt="" fill sizes="100vw" /><div className="confBiggerVeil" /><div data-conf-reveal><p className="confKicker">The bigger opportunity</p><h2>A private place<br /><em>to say something real.</em></h2><p>Then an experience + revenue source + content engine + customer acquisition tool + sponsorship platform + event product + creator discovery channel + hardware product + software business + physical media network.</p><strong>SPILL CONFESSIONAL<br />Step in. Sit down. SPILL.</strong><div className="actions"><Link className="button primary" href="/create">Book a Confessional</Link><Link className="button secondary" href="/partner">Bring Confessional to an event</Link></div></div></div>
    </section>
  </main>;
}
