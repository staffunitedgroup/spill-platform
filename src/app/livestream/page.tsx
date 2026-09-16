import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { GlobalHeader } from "@/components/global-header";
import { LivestreamAnimations } from "@/components/livestream-animations";

export const metadata: Metadata = {
  title: "SPILL Livestream — Live People, Ideas & Culture",
  description: "A professionally produced live platform for people, ideas, culture, brands, and discovery—built into the energy of SPILL Saigon.",
};

const entryPaths = [
  ["01", "Book an appearance", "An accessible professional media opportunity for people with something worth sharing."],
  ["02", "Editorial invitation", "Interesting guests, subjects, stories, and expertise selected by SPILL."],
  ["03", "Sponsor-funded access", "Brand-supported opportunities that open the platform to new talent and communities."],
];

const businessFormats = ["Founder interviews", "Executive conversations", "Product introductions", "Company stories", "Employer branding", "Recruitment campaigns", "Industry discussions", "Expert commentary", "Customer conversations", "Startup launches", "Brand storytelling", "Panel conversations"];
const contentOutputs = ["Full livestream replay", "Vertical clips", "Best moments", "Quote assets", "Guest introductions", "Behind the scenes", "Reels + TikToks", "YouTube Shorts", "LinkedIn clips", "Collaborative posts", "Story content", "Teasers + thumbnails"];
const programming = [
  ["People", "Founders, creators, artists, chefs, musicians, executives, travelers, professionals, and community figures."],
  ["Ideas", "Business, technology, hospitality, culture, creativity, media, design, entrepreneurship, and emerging trends."],
  ["Discovery", "New brands, projects, products, restaurants, concepts, artists, and talent."],
  ["Entertainment", "Games, challenges, audience interaction, debates, demonstrations, and spontaneous conversations."],
];
const sponsorInventory = [
  ["Platform sponsor", "SPILL Livestream presented by a brand."],
  ["Episode sponsor", "A partner owns a particular live conversation."],
  ["Series sponsor", "A recurring topic, community, or cultural format."],
  ["Segment sponsor", "Founder of the Day, Creator Spotlight, Saigon Stories, and more."],
  ["Participant sponsor", "A company funds access for selected people or communities."],
  ["Product + venue", "Natural integration across drinks, technology, fashion, screens, and spaces."],
  ["Branded content", "A live concept built around a campaign objective."],
];
const sponsorValue = ["Livestream branding", "Host mentions", "Visual integration", "Social tagging", "Collaborative posts", "Short-form clips", "Branded segments", "Guest involvement", "Audience activation", "On-site activation", "Product placement", "Sampling", "Event integration", "Series ownership", "Performance reporting"];
const flywheel = ["Affordable participation", "More guests", "More content", "More audience", "Stronger guests", "Greater credibility", "Sponsors", "Free opportunities", "New talent", "New audiences", "Podcast discovery", "Bigger opportunities"];
const platformPillars = [
  ["Accessible media platform", "A professional stage without the barrier of launching a full show."],
  ["Content engine", "A constant library of live and short-form media."],
  ["Distribution network", "Every participant can introduce a new connected audience."],
  ["Recurring programming", "A reason to keep watching and returning to SPILL."],
  ["Podcast discovery", "A tested pipeline of personalities, stories, and ideas."],
  ["Sponsorship platform", "Meaningful brand participation beyond logo placement."],
  ["Business channel", "A media product for founders, companies, and campaigns."],
  ["Physical + digital venue", "Content brings people in; the room gives content energy."],
];

export default function LivestreamPage() {
  return <main className="livePage">
    <LivestreamAnimations />
    <section className="liveHero">
      <div className="liveHeroBackdrop" />
      <GlobalHeader />
      <div className="liveHeroGrid">
        <div className="liveHeroCopy">
          <div className="liveSignal"><i /> Live from SPILL Saigon</div>
          <p className="eyebrow">People · Ideas · Culture · Brands · Discovery</p>
          <h1>Appear.<br />Share.<br />Connect. <em>Grow.</em></h1>
          <p>Come to SPILL with something worth sharing. We give you the platform, production, audience, and opportunity to take it further.</p>
          <strong>Professional production. Real audience. Shareable content.</strong>
          <div className="actions"><Link className="button primary" href="/create">Book your appearance <span>↗</span></Link><a className="button secondary" href="https://www.youtube.com/@spillsaigon" target="_blank" rel="noreferrer">Watch SPILL live</a></div>
        </div>
        <div className="liveHeroPoster"><Image src="/assets/spill/livestream/hero.png" alt="SPILL Livestream hosts speaking with a live audience at SPILL Saigon" fill preload sizes="(max-width: 820px) 100vw, 44vw" /></div>
      </div>
      <div className="liveTicker"><span>Creators</span><i>•</i><span>Founders</span><i>•</i><span>Brands</span><i>•</i><span>Culture</span><i>•</i><span>Real stories</span><i>•</i><span>Live audience</span></div>
    </section>

    <section className="liveEntryPreview" id="participate">
      <div data-live-reveal><p className="liveKicker">01 / The core model</p><h2>Your way<br /><em>onto the platform.</em></h2><p className="liveLead">Come to SPILL. Get on camera. Have a great conversation. Reach an audience. Leave with content worth sharing.</p></div>
      <div className="liveEntryPreviewGrid">{entryPaths.map(([number, title, copy], index) => <article key={title} data-live-reveal><span>{number}</span><h3>{title}</h3><div><p>{copy}</p>{index === 0 && <Link href="/create">Book an appearance →</Link>}{index === 2 && <Link href="/partner">Fund a community series →</Link>}</div></article>)}</div>
    </section>

    <section className="liveBusiness">
      <div className="liveBusinessIntro" data-live-reveal><p className="liveKicker">02 / Commercial participation</p><h2>A live media product<br /><em>for business.</em></h2><p>SPILL serves the individual seeking an accessible media opportunity and the company seeking a professional branded production. Commercial appearances scale according to production complexity, distribution, and deliverables.</p><Link className="button primary" href="/partner">Build a live production</Link></div>
      <div className="liveFormatGrid">{businessFormats.map((format, index) => <div key={format} data-live-reveal><span>{String(index + 1).padStart(2, "0")}</span><strong>{format}</strong></div>)}</div>
    </section>

    <section className="liveDistribution">
      <div className="liveDistributionTop" data-live-reveal><p className="liveKicker">03 / The distribution advantage</p><h2>Every guest brings<br /><em>a new audience.</em></h2><p>SPILL captures participant, business, project, and collaborator accounts so content can be published together wherever platforms allow it.</p></div>
      <div className="liveCollabFormula" data-live-reveal><span>SPILL</span><b>×</b><span>Guest</span><b>×</b><span>Company</span><b>×</b><span>Community</span><strong>= Connected reach</strong></div>
      <div className="liveAudienceSources">{["Followers", "Company audience", "Friends + network", "Collaborators", "Customers", "Communities"].map((source, index) => <article key={source} data-live-reveal><span>0{index + 1}</span><h3>{source}</h3></article>)}</div>
      <p className="liveDistributionStatement" data-live-reveal>SPILL does not build its audience entirely from zero. <em>It builds an interconnected media network through the people on the platform.</em></p>
    </section>

    <section className="liveContentEngine">
      <div className="liveContentHeading" data-live-reveal><p className="liveKicker">04 / One appearance → many pieces of content</p><h2>The livestream is<br /><em>only the beginning.</em></h2><p>A focused 15–30 minute appearance can become a complete library for SPILL and the participant.</p></div>
      <div className="liveOutputGrid">{contentOutputs.map((output, index) => <article key={output} data-live-reveal><span>{String(index + 1).padStart(2, "0")}</span><h3>{output}</h3></article>)}</div>
    </section>

    <section className="liveProgramming">
      <div className="liveProgrammingIntro" data-live-reveal><p className="liveKicker">05 / Building the SPILL audience</p><h2>Different people.<br />Different energy.<br /><em>One live platform.</em></h2><p>Not every livestream needs the same audience. Every participant can introduce SPILL to a different one. Over time, those audiences overlap and accumulate.</p></div>
      <div className="liveProgrammingGrid">{programming.map(([title, copy], index) => <article key={title} data-live-reveal><span>0{index + 1}</span><h3>{title}</h3><p>{copy}</p></article>)}</div>
    </section>

    <section className="liveAudienceSection">
      <div className="liveAudienceMedia" data-live-reveal><Image src="/assets/spill/livestream/hero.png" alt="A live audience watching a SPILL Livestream conversation" fill sizes="(max-width: 900px) 100vw, 55vw" /></div>
      <div className="liveAudienceCopy" data-live-reveal><p className="liveKicker">06 / The live audience advantage</p><h2>The room is part<br /><em>of the content.</em></h2><p>People can attend intentionally—or discover something happening while already inside SPILL. They can watch, ask questions, vote, react, join games, meet the guest afterward, and connect with one another.</p><div className="liveTagList">{["Watch", "Ask", "Vote", "React", "Participate", "Meet", "Network"].map((item) => <span key={item}>{item}</span>)}</div><strong>The content brings people into the venue. The venue gives the content energy.</strong></div>
    </section>

    <section className="liveHospitality">
      <div data-live-reveal><p className="liveKicker">07 / Food, drinks + hospitality</p><h2>Not a studio visit.<br /><em>A social experience.</em></h2></div>
      <div className="liveHospitalityCopy" data-live-reveal><p>Participants enter the wider SPILL ecosystem. They can arrive early, meet over coffee, stay for food or cocktails, connect with other guests, and continue the conversation after the cameras stop.</p><p>Preferred participant pricing and bundled hospitality can improve the experience while creating natural meetings, networking, and additional venue activity.</p><Link href="/saigon/menu">Explore SPILL Saigon’s menu <span>→</span></Link></div>
    </section>

    <section className="liveDiscovery">
      <div className="liveDiscoveryIntro" data-live-reveal><p className="liveKicker">08 / The discovery engine</p><h2>See who stands out.<br /><em>Then go deeper.</em></h2><p>SPILL can discover proven personalities and topics through real audience response—not guess who might make a great long-form guest.</p></div>
      <div className="liveDiscoveryPath">{[["01", "Livestream appearance"], ["02", "Audience response"], ["03", "Strong guest identified"], ["04", "SPILL Podcast invitation"], ["05", "Long-form episode"], ["06", "Ongoing relationship"]].map(([number, title], index) => <article key={title} data-live-reveal><span>{number}</span><h3>{title}</h3>{index < 5 && <b>↓</b>}</article>)}</div>
      <div className="liveCreatorPath" data-live-reveal><span>From guest to creator</span><p>First appearance → repeat appearances → Podcast guest → concept development → SPILL Podcast production</p><Link href="/podcast">Explore SPILL Podcast →</Link></div>
    </section>

    <section className="liveSponsors">
      <div className="liveSponsorsHeading" data-live-reveal><p className="liveKicker">09 / Sponsor + brand monetization</p><h2>Build value<br /><em>inside the content.</em></h2><p>SPILL can sell meaningful media participation—not simply signage. Brands can fund access, own formats, activate in the room, and become part of what audiences watch and share.</p></div>
      <div className="liveSponsorGrid">{sponsorInventory.map(([title, copy], index) => <article key={title} data-live-reveal><span>0{index + 1}</span><h3>{title}</h3><p>{copy}</p></article>)}</div>
      <div className="liveSponsorValue" data-live-reveal><h3>Sponsors receive more than logo placement.</h3><div>{sponsorValue.map((item) => <span key={item}>{item}</span>)}</div><Link className="button primary" href="/partner">Partner with SPILL</Link></div>
    </section>

    <section className="liveNetwork">
      <div className="liveNetworkStatement" data-live-reveal><p className="liveKicker">10 / A network effect</p><h2>50 people.<br />Then 100.<br /><em>Then 500.</em></h2><p>Every appearance produces content, introduces viewers, connects a community, and creates the chance of an unexpected hit. Some participants return. Some become podcast guests. Some launch shows. Some introduce sponsors. Some bring audiences into the venue.</p></div>
      <div className="liveSocialCurrency" data-live-reveal><span>Participation becomes social currency.</span><blockquote>“I was on SPILL.”</blockquote><p>The stronger the SPILL brand becomes, the more valuable participation becomes—and the easier it becomes to attract stronger guests, brands, and sponsors.</p></div>
    </section>

    <section className="liveFlywheelSection">
      <div className="liveFlywheelHeading" data-live-reveal><p className="liveKicker">11 / The commercial flywheel</p><h2>Every turn makes<br /><em>the platform stronger.</em></h2></div>
      <div className="liveFlywheel">{flywheel.map((step, index) => <article className="liveFlywheelStep" key={step}><span>{String(index + 1).padStart(2, "0")}</span><h3>{step}</h3>{index < flywheel.length - 1 ? <b>→</b> : <b>↻</b>}</article>)}</div>
    </section>

    <section className="livePlatform">
      <div className="livePlatformHeading" data-live-reveal><p className="liveKicker">12 / What SPILL is building</p><h2>Much bigger than<br /><em>a camera in a café.</em></h2></div>
      <div className="livePillarGrid">{platformPillars.map(([title, copy], index) => <article key={title} data-live-reveal><span>{String(index + 1).padStart(2, "0")}</span><h3>{title}</h3><p>{copy}</p></article>)}</div>
    </section>

    <section className="liveFinal">
      <Image src="/assets/spill/livestream/hero.png" alt="" fill sizes="100vw" />
      <div className="liveFinalVeil" />
      <div data-live-reveal><p className="liveKicker">The simple promise</p><h2>Come with something<br /><em>worth sharing.</em></h2><p>SPILL gives you the platform, production, audience, and opportunity to take it further.</p><strong>Appear. Share. Connect. Grow.</strong><div className="actions"><Link className="button primary" href="/create">Book your appearance</Link><Link className="button secondary" href="/podcast">See where it can lead</Link></div></div>
    </section>
  </main>;
}
