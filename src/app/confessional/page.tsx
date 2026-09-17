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
  ["Hot Take", "Share the opinion you cannot hold back."],
  ["Tell a Story", "Respond to a theme and make it yours."],
  ["Two-Person Mode", "For couples, friends, dates, family, or colleagues."],
  ["Private Mode", "Delivered only to you."],
  ["Shareable Mode", "Prepared for your social channels."],
];

const boothFeatures = ["Compact two-person sofa", "Small table + controls", "Ceiling-mounted microphone", "Two recessed ceiling lights", "Front-facing key light", "Built-in display + camera", "Acoustic treatment", "Quiet ventilation", "Privacy door", "Digital delivery"];
const consentChoices = [
  ["Private", "Only you receive the recording."],
  ["Shareable", "Prepared for you to post."],
  ["SPILL Eligible", "SPILL may publish only with your permission."],
  ["Anonymous", "Your identity can be protected."],
];
const launchMetrics = ["Sessions per day", "Peak usage times", "Solo vs two-person", "Ideal session length", "Pricing tolerance", "Free-form vs prompted", "Retake frequency", "Private vs shareable", "Social sharing rate", "Repeat usage", "Editing demand", "Staff involvement", "Cleaning + maintenance", "Equipment reliability", "Sound isolation", "Camera + lighting quality", "F&B spend before + after"];
const pricing = [
  ["SPILL Confessional", "129k–159k VND", "Recording + digital delivery"],
  ["Confessional Plus", "249k–349k VND", "More time, takes, captions, or edits"],
  ["Two-Person Confessional", "299k–449k VND", "A shared session for two"],
];
const contentOutputs = ["TikToks", "Reels", "YouTube Shorts", "Facebook clips", "Quote cards", "Compilations"];
const recurringFormats = ["The Saigon Confession", "Dating Confessions", "Unpopular Opinion", "Things I Never Said Out Loud", "My Biggest Mistake", "Why I Came to Saigon", "Before I Leave Vietnam", "Confession of the Week"];
const sponsorIdeas = ["Question of the Week", "Themed series", "Free public sessions", "Branded intro + outro", "Content campaigns", "Giveaways", "Special activations"];
const externalLocations = ["Shopping mall", "Hotel", "University", "Entertainment venue", "Partner café-bar", "Coworking space", "Airport", "Event"];
const eventUses = ["Weddings", "Corporate events", "Conferences", "Festivals", "Product launches", "Universities", "Hotels", "Nightlife activations"];
const software = ["Recording", "Prompt management", "QR delivery", "Cloud storage", "Consent management", "Branding", "Analytics", "Remote diagnostics", "Automated editing", "Captions", "Content management", "Software updates"];
const roadmap = ["Build prototype", "Install 2 units inside SPILL", "Learn + optimize", "Expand to ~4 units", "Prove economics", "Test 1 external unit", "Build a Saigon network", "Introduce event rentals", "Develop commercial hardware", "Sell, lease + license"];

export default function ConfessionalPage() {
  return <main className="confPage">
    <ConfessionalAnimations />
    <section className="confHero">
      <Image className="confHeroImage" src="/assets/spill/confessional/hero.png" alt="SPILL Confessional recording booths inside SPILL Saigon" fill loading="eager" sizes="100vw" />
      <div className="confHeroVeil" />
      <GlobalHeader />
      <div className="confHeroContent">
        <p className="confKicker">Private space · Professional recording · Your choice</p>
        <h1>Step in.<br />Sit down.<br /><em><SpillWordmark /></em>.</h1>
        <p>SPILL Confessional is a private recording booth for real stories, honest opinions, spontaneous moments, and conversations that may never happen anywhere else.</p>
        <strong>One person comfortably. Two people maximum.</strong>
        <div className="actions"><Link className="button primary" href="/create">Book a Confessional <span>↗</span></Link><a className="button secondary" href="#experience">See how it works</a></div>
      </div>
      <div className="confHeroRail"><span>Private by default</span><i>•</i><span>Share only by permission</span><i>•</i><span>Digital delivery</span></div>
    </section>

    <section className="confExperience" id="experience">
      <div className="confExperienceIntro" data-conf-reveal>
        <p className="confKicker">01 / The experience</p>
        <h2>A photobooth<br /><em>for what matters.</em></h2>
        <p>Face the built-in screen and camera. Choose a prompt. Press record. Integrated light and clean audio handle the rest.</p>
      </div>
      <div className="confSteps">
        {[["01", "Step in"], ["02", "Sit down"], ["03", "Choose a prompt"], ["04", "Press record"], ["05", "SPILL"]].map(([number, label]) => <article key={label} data-conf-reveal><span>{number}</span><h3><BrandedText text={label} tone="dark" /></h3></article>)}
      </div>
      <div className="confModeGrid">
        {modes.map(([title, copy], index) => <article key={title} data-conf-reveal><span>{String(index + 1).padStart(2, "0")}</span><h3>{title}</h3><p>{copy}</p></article>)}
      </div>
    </section>

    <section className="confPrivacy">
      <div className="confPrivacyIntro" data-conf-reveal><p className="confKicker">02 / Privacy + consent</p><h2>Say something real.<br /><em>Keep the choice.</em></h2><p>Trust is essential. Before anything leaves the booth, every participant clearly chooses what happens to the recording.</p></div>
      <div className="confConsentGrid">{consentChoices.map(([title, copy], index) => <article key={title} data-conf-reveal><span>0{index + 1}</span><h3><BrandedText text={title} /></h3><p>{copy}</p></article>)}</div>
      <strong className="confTrustLine" data-conf-reveal>Private by default. Published only with permission.</strong>
    </section>

    <section className="confBooth">
      <div className="confBoothMedia" data-conf-reveal><Image src="/assets/spill/confessional/hero.png" alt="Self-contained SPILL Confessional booth in the café-bar" fill sizes="(max-width: 900px) 100vw, 58vw" /></div>
      <div className="confBoothCopy" data-conf-reveal><p className="confKicker">03 / Inside the booth</p><h2>Everything you need.<br /><em>Nothing in the way.</em></h2><p>The camera, screen, light, microphone, acoustics, and controls disappear into one premium piece of architecture.</p><div className="confFeatureList">{boothFeatures.map((feature, index) => <span key={feature}><b>{String(index + 1).padStart(2, "0")}</b>{feature}</span>)}</div></div>
    </section>

    <section className="confEcosystem">
      <div className="confEcosystemHeading" data-conf-reveal><p className="confKicker">04 / Why it works inside SPILL</p><h2>Three formats.<br /><em>Three kinds of energy.</em></h2></div>
      <div className="confFormatCompare">
        <article data-conf-reveal><span>SPILL Podcast</span><h3>Long-form.</h3><p>Produced, deliberate, and built for depth.</p></article>
        <article data-conf-reveal><span>SPILL Livestream</span><h3>Public.</h3><p>Immediate, interactive, and made for discovery.</p><Link href="/livestream">Explore Livestream →</Link></article>
        <article className="active" data-conf-reveal><span>SPILL Confessional</span><h3>Private.</h3><p>Intimate, spontaneous, and entirely your choice.</p></article>
      </div>
      <div className="confDiscoveryPath" data-conf-reveal><span>Confessional</span><b>→</b><span>Livestream</span><b>→</b><span>Podcast</span><p>A great Confessional can reveal a personality, story, creator, or idea worth developing further.</p></div>
    </section>

    <section className="confLaunch">
      <div className="confLaunchIntro" data-conf-reveal><p className="confKicker">05 / Start inside SPILL Saigon</p><h2>Two booths.<br />Then four.<br /><em>Learn everything.</em></h2><p>The first units become SPILL’s live R&D lab. Their relocatable design lets the venue adapt them around traffic, events, seating, sponsorships, and demand.</p></div>
      <div className="confLaunchNumbers" data-conf-reveal><div><strong>02</strong><span>Units at launch</span></div><b>→</b><div><strong>~04</strong><span>After demand is proven</span></div></div>
      <div className="confMetricGrid">{launchMetrics.map((metric, index) => <article key={metric} data-conf-reveal><span>{String(index + 1).padStart(2, "0")}</span><h3>{metric}</h3></article>)}</div>
    </section>

    <section className="confRevenue">
      <div className="confRevenueHeading" data-conf-reveal><p className="confKicker">06 / Revenue inside SPILL</p><h2>Simple to enter.<br /><em>Easy to upgrade.</em></h2><p>The entry session includes recording and digital delivery. Premium packages add time, retakes, captions, editing, and social-ready clips.</p></div>
      <div className="confPriceTable">{pricing.map(([product, price, detail], index) => <article key={product} data-conf-reveal><span>0{index + 1}</span><h3><BrandedText text={product} /></h3><strong>{price}</strong><p>{detail}</p></article>)}</div>
      <div className="confFnb" data-conf-reveal><div><p className="confKicker">F&B integration</p><h3>Booth revenue + F&B spend + content value + future customer value</h3></div><ul><li>Spend 300k VND and unlock a session</li><li>Confessional + cocktail package</li><li>Preferred drink pricing after a session</li><li>Sponsored free sessions</li></ul></div>
    </section>

    <section className="confAccess">
      <div className="confAccessHeading" data-conf-reveal><p className="confKicker">07 / Three ways in</p><h2>Customers can pay.<br />Interesting people can be invited.<br /><em>Sponsors can fund access.</em></h2></div>
      <div className="confAccessGrid">
        <article data-conf-reveal><span>01 / Paid</span><h3>Book a Confessional</h3><p>A low-friction way for anyone to record something real and leave with it.</p><Link href="/create">Book a session →</Link></article>
        <article data-conf-reveal><span>02 / Editorial</span><h3>Be invited by <SpillWordmark tone="dark" /></h3><p>Creators, musicians, artists, founders, travelers, performers, local personalities, and compelling regulars.</p></article>
        <article data-conf-reveal><span>03 / Sponsored</span><h3>Open access to a community</h3><p>A partner funds selected sessions while SPILL protects the integrity of the experience.</p><Link href="/partner">Sponsor a series →</Link></article>
      </div>
    </section>

    <section className="confSponsors">
      <div className="confSponsorsIntro" data-conf-reveal><p className="confKicker">08 / Sponsorship</p><h2>Support the conversation.<br /><em>Never control it.</em></h2><p>SPILL owns the experience. The sponsor helps more people step inside it.</p></div>
      <div className="confSponsorIdeas">{sponsorIdeas.map((idea, index) => <article key={idea} data-conf-reveal><span>{String(index + 1).padStart(2, "0")}</span><h3>{idea}</h3></article>)}</div>
      <div className="confPromptWall" data-conf-reveal><span>Possible prompts</span><blockquote>“What is the biggest risk you have ever taken?”</blockquote><blockquote>“Tell us your worst first date.”</blockquote><blockquote>“What would you do with one extra day in Saigon?”</blockquote></div>
    </section>

    <section className="confContent">
      <div className="confContentHeading" data-conf-reveal><p className="confKicker">09 / The content engine</p><h2>One honest moment.<br /><em>Many ways to travel.</em></h2><p>With clear participant permission, selected recordings become an ongoing stream of authentic content.</p></div>
      <div className="confOutputGrid">{contentOutputs.map((item, index) => <article key={item} data-conf-reveal><span>0{index + 1}</span><h3>{item}</h3></article>)}</div>
      <div className="confSeries" data-conf-reveal><h3>Recurring formats</h3><div>{recurringFormats.map((format) => <span key={format}>{format}</span>)}</div></div>
    </section>

    <section className="confRelocatable">
      <div className="confRelocatableCopy" data-conf-reveal><p className="confKicker">10 / Self-contained + relocatable</p><h2>Power.<br />Internet.<br /><em><SpillWordmark /> anywhere.</em></h2><p>Every booth operates as one complete unit. Move it across the venue, take it to an event, relocate it between properties, or place it with a partner.</p></div>
      <div className="confRequirements" data-conf-reveal><span>Requires only</span><div><strong>01</strong><h3>Power</h3></div><b>+</b><div><strong>02</strong><h3>Internet</h3></div></div>
    </section>

    <section className="confExternal">
      <div className="confExternalHeading" data-conf-reveal><p className="confKicker">11 / Phase two</p><h2>First prove <SpillWordmark />.<br /><em>Then test the city.</em></h2><p>Only after the internal model works should one external unit test whether the experience can attract demand independently.</p></div>
      <div className="confExternalGrid">{externalLocations.map((location, index) => <article key={location} data-conf-reveal><span>{String(index + 1).padStart(2, "0")}</span><h3>{location}</h3></article>)}</div>
      <div className="confBigQuestion" data-conf-reveal><span>The key question</span><p>Does the Confessional work because it is inside SPILL—or can it create demand anywhere?</p></div>
    </section>

    <section className="confCityNetwork">
      <div data-conf-reveal><p className="confKicker">12 / SPILL Confessionals around Saigon</p><h2>Every booth becomes<br /><em>a door back to <SpillWordmark tone="dark" />.</em></h2></div>
      <div className="confCityMessage" data-conf-reveal><p>Each city unit is both a revenue source and a physical SPILL advertisement.</p><blockquote>Thanks for SPILLing.<br />Visit SPILL Saigon and show this QR for a preferred drink offer.</blockquote><p>External participation becomes customer acquisition for the wider ecosystem.</p></div>
    </section>

    <section className="confEvents">
      <div className="confEventsIntro" data-conf-reveal><p className="confKicker">13 / Events</p><h2>Move the booth.<br /><em>Change the prompt.</em></h2><p>The same private experience can become a memorable part of weddings, conferences, launches, universities, hotels, and nightlife.</p></div>
      <div className="confEventGrid">{eventUses.map((item, index) => <article key={item} data-conf-reveal><span>0{index + 1}</span><h3>{item}</h3></article>)}</div>
      <div className="confEventPricing" data-conf-reveal><div><span>Half-day</span><strong>8–15m VND</strong></div><div><span>Full-day</span><strong>15–30m VND</strong></div><div><span>Branded activation</span><strong>25–75m+ VND</strong></div></div>
    </section>

    <section className="confProduct">
      <div className="confProductHeading" data-conf-reveal><p className="confKicker">14 / Beyond the venue</p><h2>Hardware + software.<br /><em>Not simply a box.</em></h2><p>Once proven, the core system can serve hotels, malls, event companies, agencies, universities, corporations, entertainment venues, tourism operators, and retailers.</p></div>
      <div className="confSoftwareGrid">{software.map((item, index) => <article key={item} data-conf-reveal><span>{String(index + 1).padStart(2, "0")}</span><h3>{item}</h3></article>)}</div>
      <div className="confProductFamily">
        <article data-conf-reveal><span>SPILL Confessional</span><h3>Network units</h3><p>SPILL-branded experiences across cities.</p></article>
        <article data-conf-reveal><span>Confessional Pro</span><h3>Commercial units</h3><p>Unbranded systems for third parties.</p></article>
        <article data-conf-reveal><span>Confessional Event</span><h3>Portable activation</h3><p>Built to travel, brand, and perform.</p></article>
      </div>
    </section>

    <section className="confCorporate">
      <div data-conf-reveal><p className="confKicker">15 / Corporate video feedback</p><h2>The same booth.<br /><em>A new business tool.</em></h2></div>
      <div className="confCorporateUses" data-conf-reveal>{["Customer testimonials", "Employee stories", "Market research", "Visitor feedback", "Recruitment", "Culture programs", "Event feedback"].map((item) => <span key={item}>{item}</span>)}</div>
    </section>

    <section className="confNetwork">
      <div className="confNetworkIntro" data-conf-reveal><p className="confKicker">16 / The long-term network</p><h2>Stories across cities.<br /><em>One distributed media system.</em></h2><p>The network creates stories and personalities. The content grows the audience. The audience makes the network more valuable.</p></div>
      <div className="confCities" data-conf-reveal>{["Saigon", "Bangkok", "Tokyo", "Singapore"].map((city, index) => <div key={city}><span>0{index + 1}</span><h3><SpillWordmark /> {city}</h3>{index < 3 && <b>→</b>}</div>)}</div>
    </section>

    <section className="confRoadmap">
      <div className="confRoadmapHeading" data-conf-reveal><p className="confKicker">17 / Roadmap</p><h2>Begin intimate.<br /><em>Build the network.</em></h2></div>
      <div className="confRoadmapGrid">{roadmap.map((step, index) => <article key={step} data-conf-reveal><span>{String(index + 1).padStart(2, "0")}</span><h3><BrandedText text={step} tone="dark" /></h3>{index < roadmap.length - 1 && <b>→</b>}</article>)}</div>
    </section>

    <section className="confBigger">
      <Image src="/assets/spill/confessional/hero.png" alt="" fill sizes="100vw" />
      <div className="confBiggerVeil" />
      <div data-conf-reveal><p className="confKicker">The bigger opportunity</p><h2>A private place<br />to say something<br /><em>real.</em></h2><p>Then an experience, revenue source, content engine, acquisition tool, sponsorship platform, event product, discovery channel, hardware product, software business, and physical media network.</p><strong>Step in. Sit down. SPILL.</strong><div className="actions"><Link className="button primary" href="/create">Book a Confessional</Link><Link className="button secondary" href="/partner">Bring Confessional to an event</Link></div></div>
    </section>
  </main>;
}
