import Image from "next/image";
import Link from "next/link";
import { EventsProgramming } from "@/components/events-programming";
import { GlobalHeader } from "@/components/global-header";
import { HomeAnimations } from "@/components/home-animations";

const journey = [
  { number: "01", name: "SPILL Connections", verb: "Connect", copy: "Start better conversations with friends, dates, coworkers, new people, or someone you just met at SPILL.", cta: "Explore Connections", href: "/spill-42" },
  { number: "02", name: "SPILL Confessional", verb: "Express", copy: "Step inside. Tell your story. Keep it private, save it for yourself, or choose to let it travel further.", cta: "Explore Confessional", href: "/create" },
  { number: "03", name: "SPILL Livestream", verb: "Be seen", copy: "Share your story, talent, business, launch, performance, idea, opinion, or perspective with the SPILL audience.", cta: "Explore Livestream", href: "#livestream" },
  { number: "04", name: "SPILL Podcast", verb: "Go deeper", copy: "Build meaningful long-form conversations with professional production and room for the idea to grow.", cta: "Explore Podcast", href: "/podcast" },
  { number: "05", name: "SPILL Original", verb: "Become original", copy: "The strongest people, stories, ideas, and formats can grow into premium SPILL-developed media.", cta: "Watch Originals", href: "#originals" },
];

const storyPath = [
  ["Connections", "A conversation starts."],
  ["Confessional", "Someone decides to record it."],
  ["Livestream", "The story reaches an audience."],
  ["Podcast", "The conversation goes deeper."],
  ["Original", "The idea becomes something bigger."],
];

export default function HomePage() {
  return <main className="masterHome"><HomeAnimations />
    <section className="masterHero globalHero">
      <video className="masterHeroMedia" autoPlay muted loop playsInline poster="/assets/spill/home/common-area-poster.jpg" aria-hidden="true"><source src="/assets/spill/home/common-area.mp4" type="video/mp4" /></video>
      <div className="masterHeroVeil" /><GlobalHeader />
      <div className="masterHeroContent">
        <p className="eyebrow">A café bar. A social experience. A media platform.</p>
        <h1>First we danced.<br />Then we sang.<br /><em>Now we spill.</em></h1>
        <div className="masterHeroBottom"><p>A new kind of social venue. Media built in.</p><p>SPILL brings people together to connect, talk, create, discover, and share.</p></div>
        <div className="actions"><Link className="button primary" href="#locations">Choose your SPILL <span>↘</span></Link><Link className="button secondary" href="#journey">Explore the experience</Link></div>
      </div>
      <div className="heroCityRail" id="locations">
        <Link href="/saigon"><span>01</span><strong>SPILL Saigon</strong><small>Born in Vietnam.</small></Link>
        <Link href="/tokyo"><span>02</span><strong>SPILL Tokyo</strong><small>Coming next.</small></Link>
        <a href="#future-locations"><span>03</span><strong>More locations</strong><small>Coming soon.</small></a>
      </div>
    </section>

    <section className="masterSection whatSection" id="about-spill">
      <div className="sectionNumber">01 / What is SPILL?</div>
      <div className="statementGrid" data-reveal>
        <h2>Come together.<br /><em>See what happens.</em></h2>
        <div><p className="bodyLead">SPILL is a café bar, social experience, and media platform built around conversation, connection, expression, and discovery.</p><p>Come for coffee. Meet someone. Have a drink. Start a conversation. Keep it private, record something, step into the public spotlight, or simply enjoy being part of the room.</p></div>
      </div>
      <p className="signatureLine" data-reveal>Participation is optional. <span>Possibility is always present.</span></p>
    </section>

    <section className="masterSection journeySection" id="journey">
      <div className="sectionTopline"><div className="sectionNumber">02 / The SPILL Journey</div><p>Private connection → public platform</p></div>
      <div className="journeyIntro" data-reveal><h2>How far do you<br />want to <em>SPILL?</em></h2><p>Connect → Express → Be Seen → Go Deeper → Become Original</p></div>
      <div className="journeyGrid">
        {journey.map((step) => <article className="journeyCard" key={step.name}>
          <div className="journeyCardTop"><span>{step.number}</span><i aria-hidden="true" /></div>
          <p>{step.verb}</p><h3>{step.name}</h3><div className="journeyDetail"><p>{step.copy}</p><Link href={step.href}>{step.cta} <span>↗</span></Link></div>
        </article>)}
      </div>
    </section>

    <section className="masterSection connectionsSection" id="connections">
      <div className="connectionsVisual" data-reveal>
        <Image src="/assets/spill/home/common-area-poster.jpg" alt="People connecting over drinks at a SPILL café bar" fill sizes="(max-width: 900px) 100vw, 55vw" />
        <div className="connectionsInset"><Image src="/assets/spill/concept-spill42.webp" alt="SPILL 42 conversation menu" fill sizes="220px" /></div>
        <span>42 prompts.<br />Countless conversations.</span>
      </div>
      <div className="connectionsCopy" data-reveal><div className="sectionNumber">03 / SPILL Connections</div><h2>Real connection<br />starts <em>offline.</em></h2><p>SPILL Connections uses SPILL 42 to make starting a better conversation easier. Sit down with someone you know—or someone you have just met—and move beyond small talk.</p><div className="tagCloud"><span>Dates</span><span>Friends</span><span>Coworkers</span><span>New people</span><span>One table</span></div><Link className="textLink" href="/spill-42">Discover SPILL Connections <span>→</span></Link></div>
    </section>

    <section className="hospitalitySection" id="hospitality">
      <div className="hospitalityCopy" data-reveal><div className="sectionNumber">04 / Hospitality</div><h2>Coffee. Cocktails.<br />Food. <em>Conversation.</em></h2><p>One continuous café-bar experience, moving naturally from daytime coffee culture into a richer evening atmosphere.</p><div className="offeringList">{["Coffee", "Tea", "Food", "Cocktails", "Beer + Wine", "Signature SPILL Drinks"].map((item, index) => <span key={item}><b>0{index + 1}</b>{item}</span>)}</div><div className="inlineActions"><Link className="textLink" href="/saigon/menu">Saigon menu <span>→</span></Link><Link className="textLink mutedLink" href="/tokyo/menu">Tokyo menu · coming soon</Link></div></div>
      <div className="hospitalityGallery" data-reveal><div className="hospitalityMain"><Image src="/assets/spill/concept-menu.webp" alt="SPILL drinks and food menu" fill sizes="(max-width: 900px) 100vw, 50vw" /></div><div className="hospitalityDetail"><Image src="/assets/spill/home/coffee.jpg" alt="SPILL coffee and café branding" fill sizes="(max-width: 900px) 80vw, 28vw" /></div></div>
    </section>

    <section className="dayNightSection" aria-labelledby="day-night-heading">
      <div className="dayNightTitle" data-reveal><div className="sectionNumber">05 / Day to night</div><h2 id="day-night-heading">One SPILL.<br /><em>Different energy.</em></h2></div>
      <div className="dayNightGrid">
        <article className="dayPanel"><Image src="/assets/spill/concept-exterior-day.webp" alt="SPILL café bar during the day" fill sizes="(max-width: 760px) 100vw, 50vw" /><div><span>07:00</span><h3>Day</h3><p>Bright. Open. Social.</p><small>Coffee, food, meetings, creator work, introductions, and easy conversation.</small></div></article>
        <article className="nightPanel"><Image src="/assets/spill/home/venue-night.jpg" alt="SPILL café bar at night" fill sizes="(max-width: 760px) 100vw, 50vw" /><div><span>19:00</span><h3>Night</h3><p>Richer. Intimate. Alive.</p><small>Cocktails, livestreams, audience moments, performances, and social discovery.</small></div></article>
      </div>
      <p className="dayNightNote">The atmosphere changes. <span>The SPILL experience continues.</span></p>
    </section>

    <section className="masterSection livestreamSection" id="livestream">
      <div className="livestreamMedia" data-reveal><Image src="/assets/spill/home/common-area-poster.jpg" alt="A live SPILL audience and café bar atmosphere" fill sizes="(max-width: 900px) 100vw, 58vw" /><div className="onAir"><i /> On air</div></div>
      <div className="livestreamCopy" data-reveal><div className="sectionNumber">06 / SPILL Livestream</div><h2>Got something<br /><em>to show?</em></h2><p>SPILL Livestream gives everyday people, creators, founders, businesses, performers, and emerging talent a professional public platform.</p><p>Launch something. Perform. Tell a story. Express an opinion. Show your talent. Give people a reason to discover you.</p><strong>Professional production. Real audience. Instant visibility.</strong><Link className="textLink" href="/create">Explore SPILL Livestream <span>→</span></Link></div>
    </section>

    <section className="podcastSection" id="podcast">
      <div className="podcastHeading" data-reveal><div className="sectionNumber">07 / SPILL Podcast</div><h2>Some stories<br />deserve <em>more time.</em></h2><p>Bring your idea. SPILL helps turn it into a great production—and gives it room to grow.</p></div>
      <div className="podcastMedia" data-reveal><video autoPlay muted loop playsInline poster="/assets/spill/home/podcast-poster.jpg"><source src="/assets/spill/home/podcast.mp4" type="video/mp4" /></video><span>Long-form conversations,<br />professionally produced.</span></div>
      <div className="podcastChoices">
        <article data-reveal><span>01</span><h3>Create your podcast</h3><p>Bring your concept or existing show to SPILL for development, recording, editing, content creation, and ongoing support.</p><Link href="/podcast#inquiry">Produce with SPILL →</Link></article>
        <article data-reveal><span>02</span><h3>Be part of SPILL Podcast</h3><p>Exceptional people and stories discovered through the wider SPILL ecosystem can be invited back for deeper conversations.</p><a href="https://www.youtube.com/@spillsaigon" target="_blank" rel="noreferrer">Watch SPILL Podcast ↗</a></article>
      </div>
    </section>

    <section className="masterSection originalsSection" id="originals">
      <div className="originalsIntro" data-reveal><div className="sectionNumber">08 / Premium SPILL-developed media</div><h2>SPILL<br /><em>Originals.</em></h2><p>The strongest ideas from across the SPILL ecosystem can grow into shows, series, stories, interviews, documentaries, performances, and media properties for YouTube and wider distribution.</p><a className="button primary" href="https://www.youtube.com/@spillsaigon" target="_blank" rel="noreferrer">Watch SPILL Originals ↗</a></div>
      <div className="originalsBoard" aria-label="SPILL Originals concepts">
        {["Local Legends", "Founders at SPILL", "42 Questions", "The Big SPILL"].map((name, index) => <article key={name}><span>0{index + 1}</span><h3>{name}</h3><small>In development</small></article>)}
      </div>
    </section>

    <section className="masterSection storySection" aria-labelledby="story-heading">
      <div className="storyIntro" data-reveal><div className="sectionNumber">09 / The physical-to-digital flywheel</div><h2 id="story-heading">One story.<br /><em>Many possibilities.</em></h2></div>
      <div className="storyPath">{storyPath.map(([title, detail], index) => <article key={title}><span>0{index + 1}</span><div><h3>SPILL {title}</h3><p>{detail}</p></div>{index < storyPath.length - 1 && <b aria-hidden="true">↓</b>}</article>)}</div>
      <div className="distributionRail"><span>Clips</span><i>→</i><span>YouTube</span><i>→</i><span>Social</span><i>→</i><span>Audience</span><i>→</i><span>Events</span><i>→</i><span>Partnerships</span><i>→</i><strong>New people at SPILL</strong></div>
    </section>

    <section className="peopleSection" id="people">
      <div className="peopleHeading" data-reveal><div className="sectionNumber">10 / People of SPILL</div><h2>Interesting people<br />are <em>everywhere.</em></h2><p>SPILL gives them somewhere to be discovered.</p></div>
      <div className="peopleGrid">
        <article className="peopleFeature"><Image src="/assets/spill/home/podcast-poster.jpg" alt="People in conversation on SPILL Podcast" fill sizes="(max-width: 760px) 100vw, 50vw" /><span>Founders · Creators · Professionals</span></article>
        <article><Image src="/assets/spill/concept-exterior-day.webp" alt="People gathering at a SPILL café bar" fill sizes="(max-width: 760px) 100vw, 25vw" /><span>Visitors · New connections</span></article>
        <article><Image src="/assets/spill/home/common-area-poster.jpg" alt="Friends gathering at SPILL" fill sizes="(max-width: 760px) 100vw, 25vw" /><span>Everyday people · Great stories</span></article>
      </div>
      <div className="peopleLabels"><span>Creators</span><span>Founders</span><span>Chefs</span><span>Musicians</span><span>Artists</span><span>Businesses</span><span>Visitors</span></div>
    </section>

    <EventsProgramming />

    <section className="masterSection chooseSection" id="future-locations">
      <div className="chooseHeading" data-reveal><div className="sectionNumber">12 / Choose your SPILL</div><h2>Where will<br />you <em>SPILL?</em></h2></div>
      <div className="chooseGrid">
        <Link className="cityCard saigonCard" href="/saigon"><Image src="/assets/spill/concept-exterior-day.webp" alt="SPILL Saigon" fill sizes="(max-width: 900px) 100vw, 50vw" /><div className="cityCardVeil" /><div><span>01 / Launching soon</span><h3>SPILL Saigon</h3><p>The original. Born in Vietnam.</p><b>Explore SPILL Saigon →</b></div></Link>
        <Link className="cityCard tokyoCard" href="/tokyo"><div><span>02 / Coming next</span><h3>SPILL Tokyo</h3><p>Same SPILL system. A new local expression.</p><b>Explore SPILL Tokyo →</b></div></Link>
        <div className="futureCard"><span>03 / Future locations</span><h3>Hanoi · Bangkok<br />+ What comes next</h3><p>A global system, always rooted in local community and culture.</p><Link href="/partner">Discover what’s next →</Link></div>
      </div>
    </section>

    <section className="brandStatement">
      <div className="brandStatementMark" aria-hidden="true">“</div>
      <div data-reveal><p>Karaoke gave everyday people the microphone.</p><h2>SPILL gives everyday<br />people the <em>platform.</em></h2><p>Come with followers or without them. Come with a business, a story, an idea, a question, or nothing planned at all. Talk. Listen. Connect. Participate. Discover what happens next.</p></div>
    </section>

    <section className="finalCta">
      <Image src="/assets/spill/home/venue-night.jpg" alt="" fill sizes="100vw" /><div className="finalCtaVeil" />
      <div data-reveal><p className="eyebrow">What are you doing tonight?</p><h2>Let’s go<br /><em>SPILL.</em></h2><p>Come for a coffee. Stay for a drink. Meet someone. Start a conversation. Join the audience. Take the mic. Watch something happen—or make something happen.</p><div className="actions"><a className="button primary" href="#locations">Find your SPILL</a><a className="button secondary" href="#journey">Explore the experience</a></div></div>
    </section>
  </main>;
}
