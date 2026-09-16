import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { GlobalHeader } from "@/components/global-header";
import { PodcastAnimations } from "@/components/podcast-animations";
import { PodcastInquiryForm } from "@/components/podcast-inquiry-form";

export const metadata: Metadata = {
  title: "SPILL Podcast — Professional Podcast Production",
  description: "Create, record, produce, and grow a professional podcast at SPILL—or discover the people and stories SPILL believes deserve a deeper conversation.",
};

const production = ["Cameras", "Microphones", "Lighting", "Audio", "Recording", "Monitoring", "Production supervision", "Media management"];
const postProduction = ["Multicamera editing", "Audio editing + mixing", "Sound cleanup", "Color correction", "Titles + lower thirds", "Graphics + subtitles", "Intros + outros", "Thumbnails + trailers"];
const contentEngine = ["Full video episode", "Audio podcast", "Short clips", "Reels / Shorts / TikTok", "LinkedIn content", "Trailers + teasers", "Guest content", "Promotional assets"];
const benefits = [
  ["Professional production", "A fully operated production environment."],
  ["Full post-production", "Finished episodes, audio, graphics, and content."],
  ["Content creation", "Turn long-form conversations into multiple media assets."],
  ["Recurring production", "Build a consistent show with an established workflow."],
  ["Hospitality benefits", "Preferred café and bar benefits for eligible partners."],
  ["Better guest experience", "Meet over coffee, food, or drinks before and after."],
  ["Live audience", "Selected productions can bring the conversation into the room."],
  ["Creator connections", "Meet founders, guests, creators, and collaborators."],
  ["SPILL promotion", "Selected productions can feature across SPILL channels."],
  ["Sponsorship", "Suitable shows can develop sponsor and brand relationships."],
  ["Events + launches", "Turn episodes and milestones into physical experiences."],
  ["Original potential", "Exceptional ideas can grow into SPILL media properties."],
];
const journey = [
  ["01", "SPILL Connections", "Connect privately."],
  ["02", "SPILL Confessional", "Express something."],
  ["03", "SPILL Livestream", "Be seen."],
  ["04", "SPILL Podcast", "Go deeper."],
  ["05", "SPILL Original", "Build something bigger."],
];
const capabilities = [
  ["Show development", "Concept, format, structure, and positioning."],
  ["Pre-production", "Topics, guest research, questions, and episode planning."],
  ["Recording", "Professional multi-camera video and audio production."],
  ["Post-production", "Editing, sound, color, graphics, and subtitles."],
  ["Short-form content", "Reels, Shorts, TikTok, and social clips."],
  ["Recurring production", "Weekly, monthly, seasonal, and branded series."],
  ["Audience experiences", "Selected live audience productions."],
  ["Brand integration", "Show branding, sponsor placement, and branded series."],
  ["Launch + events", "Premieres, launches, Q&A, and creator events."],
  ["Commercial growth", "Selected promotion, sponsorship, and partnerships."],
];
const faqs = [
  ["Can SPILL help me start a podcast from scratch?", "Yes. SPILL can help develop the concept, format, production approach, launch, and recurring content plan."],
  ["Can I bring an existing podcast?", "Yes. SPILL can provide professional recording, production, editing, content creation, and recurring production."],
  ["Who operates the equipment?", "The SPILL production team operates the recording environment so the host and guests can focus on the conversation."],
  ["Can SPILL edit the podcast?", "Yes. Full video and audio post-production is available, or raw media can be supplied where agreed."],
  ["Can SPILL create social clips?", "Yes. Long-form recordings can become short-form content for multiple platforms."],
  ["Can I record multiple episodes together?", "Yes. Batch-production and content-day formats are available."],
  ["Can my business create its own podcast?", "Yes. SPILL develops branded podcasts, business series, executive interviews, and other long-form content."],
  ["Can my podcast have a live audience?", "Selected productions can include audience experiences inside SPILL."],
  ["Can SPILL help with guests or sponsorship?", "Suitable projects can benefit from introductions, community connections, sponsorship, and brand partnership opportunities."],
  ["Do I need to go through Livestream first?", "No. Professional clients can come directly to SPILL Podcast. Livestream is also an organic discovery path for standout people and stories."],
  ["What is a SPILL Original?", "A premium SPILL-owned or SPILL-developed media property built from a particularly strong idea, story, person, or format."],
];

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="podSectionLabel">{children}</p>;
}

export default function PodcastPage() {
  return <main className="podcastPage">
    <PodcastAnimations />

    <section className="podHero">
      <Image className="podHeroImage" src="/assets/spill/podcast/hero.png" alt="Two people having a professionally recorded conversation in the SPILL Podcast café bar" fill preload sizes="100vw" />
      <div className="podHeroVeil" />
      <GlobalHeader />
      <div className="podHeroContent">
        <p className="eyebrow">SPILL Podcast · Long-form conversations</p>
        <h1>Some stories<br />deserve<span className="podMobileBreak"><br /></span>{"\u00a0"}<em>more time.</em></h1>
        <p>SPILL Podcast is where conversations go deeper. Create your own professionally produced podcast, build a recurring series, or discover the people and stories SPILL believes deserve a longer conversation.</p>
        <strong>Bring your idea. We’ll help turn it into a great production—and give it the opportunity to grow.</strong>
        <div className="actions"><a className="button primary" href="#inquiry">Start your podcast <span>↘</span></a><a className="button secondary" href="#watch">Watch SPILL Podcast</a></div>
      </div>
      <div className="podHeroMeta"><span>Depth</span><span>Personality</span><span>Production quality</span><span>Hospitality</span></div>
    </section>

    <section className="podSection podTwoWays" id="start">
      <div className="podSectionIntro" data-pod-reveal><SectionLabel>01 / Two ways into SPILL Podcast</SectionLabel><h2>Create your own.<br /><em>Or be part of ours.</em></h2></div>
      <div className="podPathGrid">
        <article data-pod-reveal><span>01 / Professional production</span><h3>Create your podcast</h3><p>Have an idea, an existing show, or a business that needs a stronger media platform? SPILL can help develop, record, produce, edit, and grow the production around it.</p><ul><li>Creators + founders</li><li>Experts + personal brands</li><li>Businesses + organizations</li><li>New or existing shows</li></ul><a className="podArrowLink" href="#inquiry">Start a production <b>→</b></a></article>
        <article data-pod-reveal><span>02 / SPILL editorial</span><h3>Be part of SPILL Podcast</h3><p>SPILL invites interesting people, founders, creators, personalities, businesses, and stories into its own deeper long-form conversations.</p><ul><li>SPILL Connections</li><li>Confessional + Livestream</li><li>Events + community</li><li>Direct editorial invitation</li></ul><a className="podArrowLink" href="#watch">Watch SPILL Podcast <b>↗</b></a></article>
      </div>
    </section>

    <section className="podSection podEntry">
      <article data-pod-reveal><span className="podIndex">02 / Start with an idea</span><h2>Have the idea.<br /><em>We can build around it.</em></h2><p>You do not need to arrive with a fully developed show. Bring something worth talking about and SPILL can shape the concept, positioning, audience, title, episode structure, visual direction, guest strategy, pilot, launch, and recurring plan.</p><a className="podArrowLink" href="#inquiry">Tell us your idea <b>→</b></a></article>
      <article data-pod-reveal><span className="podIndex">03 / Existing shows</span><h2>Already have a show?<br /><em>Bring it to SPILL.</em></h2><p>Move an existing podcast into a professionally managed environment with consistent video, audio, editing, social output, batch recording, guest episodes, audience recordings, and special productions.</p><a className="podArrowLink" href="#inquiry">Produce your show at SPILL <b>→</b></a></article>
    </section>

    <section className="podProduction">
      <div className="podProductionHeading" data-pod-reveal><SectionLabel>04 / Professional production</SectionLabel><h2>You talk.<br /><em>SPILL handles the production.</em></h2><p>Walk in ready to talk. Leave the technical workflow to SPILL.</p></div>
      <div className="podProductionGrid">{production.map((item, index) => <div key={item} data-pod-reveal><span>{String(index + 1).padStart(2, "0")}</span><p>{item}</p></div>)}</div>
      <div className="podPost" data-pod-reveal><div><SectionLabel>05 / Full post-production</SectionLabel><h3>From recording to finished episode.</h3><p>SPILL can manage the complete post-production process. Established internal teams can also receive professionally recorded media for their own workflow.</p><a className="podArrowLink" href="#inquiry">Discuss your production <b>→</b></a></div><ul>{postProduction.map((item) => <li key={item}>{item}</li>)}</ul></div>
    </section>

    <section className="podContentEngine">
      <div className="podContentIntro" data-pod-reveal><SectionLabel>06 / Content engine</SectionLabel><h2>One conversation.<br /><em>More content.</em></h2><p>A SPILL Podcast recording can become an entire library of long-form and short-form content designed for different audiences and platforms.</p></div>
      <div className="podContentFlow">{contentEngine.map((item, index) => <div key={item} data-pod-reveal><span>{String(index + 1).padStart(2, "0")}</span><strong>{item}</strong>{index < contentEngine.length - 1 && <b>→</b>}</div>)}</div>
      <p className="podEngineLine" data-pod-reveal>More than one published episode. <span>A repeatable content engine.</span></p>
    </section>

    <section className="podSection podSeries">
      <div className="podSeriesIntro" data-pod-reveal><SectionLabel>07 / Recurring + batch production</SectionLabel><h2>Build something<br /><em>people come back to.</em></h2><p>Weekly, biweekly, monthly, limited, seasonal, interview, and branded shows—with stronger consistency, scheduling, audience habits, and a more efficient production rhythm.</p><a className="button primary" href="#inquiry">Build a series</a></div>
      <div className="podBatch" data-pod-reveal><span>Batch production</span><h3>Create more<br />in less time.</h3><p>Record multiple episodes in one planned production block. Ideal for founders, executives, international guests, recurring creators, and seasonal shows.</p><strong>One production session can create weeks of finished content.</strong></div>
    </section>

    <section className="podBrandSeries">
      <div className="podBrandSeriesCopy" data-pod-reveal><SectionLabel>08 / Brands + businesses</SectionLabel><h2>Your business can have<br /><em>a media platform of its own.</em></h2><p>SPILL develops professionally produced podcast and video series for companies and organizations—from founder conversations and executive interviews to customer stories, educational programs, company culture, and branded entertainment.</p><a className="button primary" href="#inquiry">Create a branded series</a></div>
      <div className="podBrandFormats" data-pod-reveal>{["Founder conversations", "Thought leadership", "Industry discussions", "Customer stories", "Recruitment content", "Branded entertainment"].map((format, index) => <span key={format}><b>0{index + 1}</b>{format}</span>)}</div>
    </section>

    <section className="podSection podBenefits">
      <div className="podSectionIntro" data-pod-reveal><SectionLabel>09 / More than production</SectionLabel><h2>Produce at SPILL.<br /><em>Become part of something bigger.</em></h2></div>
      <div className="podBenefitsGrid">{benefits.map(([title, copy], index) => <article key={title} data-pod-reveal><span>{String(index + 1).padStart(2, "0")}</span><h3>{title}</h3><p>{copy}</p></article>)}</div>
    </section>

    <section className="podHospitality">
      <div className="podHospitalityMedia" data-pod-reveal><Image src="/assets/spill/home/podcast-poster.jpg" alt="A SPILL Podcast conversation inside the café bar" fill sizes="(max-width: 900px) 100vw, 55vw" /></div>
      <div className="podHospitalityCopy" data-pod-reveal><SectionLabel>10 / SPILL hospitality</SectionLabel><h2>Record. Meet.<br /><em>Stay a while.</em></h2><p>Meet a guest over coffee, prepare for the recording, produce the episode, continue the conversation over food or drinks, meet collaborators, or entertain sponsors—without moving to another location.</p><p>Eligible recurring creators and production partners can receive preferred SPILL café and bar benefits.</p><strong>SPILL can become more than where you record. It can become the home around your show.</strong></div>
    </section>

    <section className="podSection podLiveAudience">
      <div className="podLiveHeadline" data-pod-reveal><SectionLabel>11 / Live audience podcast</SectionLabel><h2>Bring the conversation<br /><em>into the room.</em></h2></div>
      <div className="podLiveBody" data-pod-reveal><p>Selected productions can include a live audience for special episodes, launches, founder conversations, audience Q&A, community discussions, milestone recordings, and sponsor-supported sessions.</p><div>{["Energy", "Interaction", "Community", "Audience loyalty", "Social content", "Sponsor value"].map((item) => <span key={item}>{item}</span>)}</div><a className="podArrowLink" href="#inquiry">Ask about audience recordings <b>→</b></a></div>
    </section>

    <section className="podSection podNetwork">
      <div data-pod-reveal><SectionLabel>12 / Creator + guest network</SectionLabel><h2>Better conversations start with <em>interesting people.</em></h2><p>SPILL brings together creators, founders, entrepreneurs, artists, chefs, musicians, executives, investors, designers, professionals, travelers, and interesting everyday people. Suitable shows can benefit from creator introductions, guest connections, crossover episodes, collaborations, and shared events.</p></div>
      <div className="podCommercialRows">
        <article data-pod-reveal><span>Sponsorship + partnerships</span><h3>Build value around the show.</h3><p>Episode and series sponsorship, presenting partners, branded segments, sponsored clips, audience-event partnerships, hospitality integration, and in-venue activation.</p><strong>Content + Creator + Audience + Venue + Hospitality</strong></article>
        <article data-pod-reveal><span>Launches + special events</span><h3>Launch the show at SPILL.</h3><p>Turn a new podcast or important episode into a physical experience with premieres, Q&A sessions, sponsor receptions, creator gatherings, and networking.</p><strong>A digital show can begin with a real room full of people.</strong></article>
      </div>
    </section>

    <section className="podSection podJourneySection">
      <div className="podSectionIntro" data-pod-reveal><SectionLabel>13 / Where Podcast fits</SectionLabel><h2>Go deeper.<br /><em>Then build bigger.</em></h2><p>A standout person or story can move naturally through the ecosystem. Professional clients can also come directly to SPILL Podcast.</p></div>
      <div className="podJourney">{journey.map(([number, title, copy], index) => <article className={`podJourneyStep${index === 3 ? " active" : ""}`} key={title}><span>{number}</span><div><h3>{title}</h3><p>{copy}</p></div>{index < journey.length - 1 && <b>↓</b>}</article>)}</div>
    </section>

    <section className="podOriginal">
      <div data-pod-reveal><SectionLabel>14 / From Podcast to SPILL Original</SectionLabel><h2>Some ideas deserve<br /><em>to become more.</em></h2><p>A particularly strong conversation can develop into a recurring series, documentary format, creator-led show, cultural property, branded SPILL format, or premium YouTube programming.</p><strong>Podcast tells the full story. SPILL Original builds the property around it.</strong><Link className="button secondary" href="/#originals">Explore SPILL Originals</Link></div>
    </section>

    <section className="podSection podWatch" id="watch">
      <div className="podWatchHeading" data-pod-reveal><div><SectionLabel>15 / Featured SPILL Podcast</SectionLabel><h2>Watch<br /><em>SPILL Podcast.</em></h2></div><a className="podArrowLink" href="https://www.youtube.com/@spillsaigon" target="_blank" rel="noreferrer">Watch all episodes <b>↗</b></a></div>
      <div className="podEpisodeGrid">
        {["Founders at SPILL", "Culture in conversation", "People worth knowing"].map((title, index) => <a key={title} href="https://www.youtube.com/@spillsaigon" target="_blank" rel="noreferrer" data-pod-reveal><Image src={index === 1 ? "/assets/spill/podcast/hero.png" : "/assets/spill/home/podcast-poster.jpg"} alt="" fill sizes="(max-width: 760px) 100vw, 33vw" /><div><span>{index === 0 ? "Coming soon" : "SPILL Podcast"}</span><h3>{title}</h3><b>Play ↗</b></div></a>)}
      </div>
    </section>

    <section className="podEnvironment">
      <div className="podEnvironmentMedia" data-pod-reveal><video autoPlay muted loop playsInline poster="/assets/spill/podcast/hero.png"><source src="/assets/spill/home/podcast.mp4" type="video/mp4" /></video><span>Made to look as good as it sounds.</span></div>
      <div className="podEnvironmentCopy" data-pod-reveal><SectionLabel>16 / The SPILL Podcast environment</SectionLabel><h2>Distinctive by design.<br /><em>Flexible by format.</em></h2><p>A professionally designed environment gives every production strong visual identity while allowing suitable customization for individual shows, brands, guests, and sponsors.</p><ul><li>Two- and three-person formats</li><li>Professional camera, microphone, and lighting setup</li><li>Guest and live audience configurations</li><li>Direct connection to SPILL café-bar hospitality</li><li>Client branding opportunities</li></ul></div>
    </section>

    <section className="podSection podCapabilities">
      <div className="podSectionIntro" data-pod-reveal><SectionLabel>17 / Complete production support</SectionLabel><h2>What SPILL<br /><em>can handle.</em></h2></div>
      <div className="podCapabilityGrid">{capabilities.map(([title, copy], index) => <article key={title} data-pod-reveal><span>{String(index + 1).padStart(2, "0")}</span><h3>{title}</h3><p>{copy}</p></article>)}</div>
    </section>

    <section className="podLocations">
      <div className="podLocationsHeading" data-pod-reveal><SectionLabel>18 / Choose a location</SectionLabel><h2>Where do you<br /><em>want to record?</em></h2></div>
      <div className="podLocationGrid">
        <Link href="/saigon/podcast" data-pod-reveal><span>01 / Launching soon</span><h3>SPILL Saigon</h3><p>Professional podcast production in Saigon.</p><b>SPILL Podcast Saigon →</b></Link>
        <Link className="coming" href="/tokyo/podcast" data-pod-reveal><span>02 / Coming next</span><h3>SPILL Tokyo</h3><p>Tokyo stories, culture, creators, and partnerships within the SPILL production system.</p><b>SPILL Podcast Tokyo →</b></Link>
      </div>
    </section>

    <section className="podSection podFaq">
      <div className="podFaqHeading" data-pod-reveal><SectionLabel>19 / Frequently asked questions</SectionLabel><h2>Before we<br /><em>press record.</em></h2></div>
      <div className="podFaqList">{faqs.map(([question, answer]) => <details key={question} data-pod-reveal><summary>{question}<span>+</span></summary><p>{answer}</p></details>)}</div>
    </section>

    <section className="podInquiry" id="inquiry">
      <div className="podInquiryIntro" data-pod-reveal><SectionLabel>20 / Start a production</SectionLabel><h2>Tell us what<br /><em>you want to create.</em></h2><p>Share the idea, the existing show, or the outcome you need. We’ll start with the conversation and build the right production around it.</p></div>
      <div data-pod-reveal><PodcastInquiryForm /></div>
    </section>

    <section className="podFinal">
      <Image src="/assets/spill/podcast/hero.png" alt="" fill sizes="100vw" />
      <div className="podFinalVeil" />
      <div data-pod-reveal><p className="eyebrow">Ready when you are</p><h2>Your idea deserves<br /><em>a great production.</em></h2><p>Bring your idea. SPILL helps turn it into a great production—and gives it the opportunity to grow.</p><div className="actions"><a className="button primary" href="#inquiry">Start your podcast</a><a className="button secondary" href="#watch">Watch SPILL Podcast</a></div></div>
    </section>
  </main>;
}
