import Image from "next/image";
import Link from "next/link";
import { EventsProgramming } from "@/components/events-programming";
import { GlobalHeader } from "@/components/global-header";
import { HomeAnimations } from "@/components/home-animations";
import { BrandedText, SpillWordmark } from "@/components/brand-text";

const journey = [
  { number: "01", name: "SPILL Connections", verb: "Connect", copy: "Start better conversations with friends, dates, coworkers, new people, or someone you just met at SPILL.", cta: "Explore Connections", href: "/spill-42", image: "/assets/spill/home/journey/connections.png" },
  { number: "02", name: "SPILL Confessional", verb: "Express", copy: "Step inside. Tell your story. Keep it private, save it for yourself, or choose to let it travel further.", cta: "Explore Confessional", href: "/confessional", image: "/assets/spill/home/journey/confessional.png" },
  { number: "03", name: "SPILL Livestream", verb: "Be seen", copy: "Share your story, talent, business, launch, performance, idea, opinion, or perspective with the SPILL audience.", cta: "Explore Livestream", href: "/livestream", image: "/assets/spill/home/journey/livestream.png" },
  { number: "04", name: "SPILL Podcast", verb: "Go deeper", copy: "Build meaningful long-form conversations with professional production and room for the idea to grow.", cta: "Explore Podcast", href: "/podcast", image: "/assets/spill/home/journey/podcast.png" },
  { number: "05", name: "SPILL Original", verb: "Become original", copy: "The strongest people, stories, ideas, and formats can grow into premium SPILL-developed media.", cta: "Watch Originals", href: "#originals", image: "/assets/spill/home/journey/original.png" },
];

const storyPath = [
  { title: "Connections", detail: "A conversation starts.", image: "/assets/spill/home/journey/connections.png" },
  { title: "Confessional", detail: "Someone decides to record it.", image: "/assets/spill/home/journey/confessional.png" },
  { title: "Livestream", detail: "The story reaches an audience.", image: "/assets/spill/home/journey/livestream.png" },
  { title: "Podcast", detail: "The conversation goes deeper.", image: "/assets/spill/home/journey/podcast.png" },
  { title: "Original", detail: "The idea becomes something bigger.", image: "/assets/spill/home/journey/original.png" },
];

const ecosystemStages = [
  { title: "Venues", detail: "The physical front door.", image: "/assets/spill/home/ecosystem-venues.png" },
  { title: "Experiences", detail: "Connection · Confessional · Livestream · Podcast · Originals", image: "/assets/spill/home/ecosystem-experiences.png" },
  { title: "Content", detail: "Vertical clips · livestreams · interviews · social posts", image: "/assets/spill/home/ecosystem-content.png" },
  { title: "Creators", detail: "Faces, voices and ideas worth discovering.", image: "/assets/spill/home/ecosystem-creators.png" },
  { title: "Community", detail: "Comments · shares · audiences · people returning", image: "/assets/spill/home/ecosystem-community.png" },
  { title: "Culture", detail: "Moments spreading outside SPILL.", image: "/assets/spill/home/ecosystem-culture.png" },
  { title: "SPILL Streaming", detail: "SPILL on TV · mobile · tablet", image: "/assets/spill/home/ecosystem-streaming.png" },
  { title: "Back to SPILL", detail: "Digital discovery becomes real-world connection.", image: "/assets/spill/home/ecosystem-back-to-spill.png" },
] as const;

export default function HomePage() {
  return <main className="masterHome"><HomeAnimations />
    <section className="masterHero globalHero">
      <video className="masterHeroMedia" autoPlay muted loop playsInline preload="metadata" poster="/assets/spill/home/hero-v2-poster.jpg" aria-hidden="true"><source src="/assets/spill/home/hero-v2.mp4" type="video/mp4" />Your browser does not support background video.</video>
      <div className="masterHeroVeil" /><GlobalHeader />
      <div className="masterHeroContent">
        <p className="eyebrow">A café bar. A social experience. A media platform.</p>
        <h1>First we danced<br />Then we sang<br /><em>Now we <SpillWordmark /></em></h1>
        <div className="masterHeroBottom"><p>Come for coffee, drinks and connection. Stay for the experiences. Become part of something that can travel far beyond the room.</p></div>
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
        <h2>The venue is<br /><em>just the beginning.</em></h2>
        <div><p className="bodyLead">SPILL Café Bar is not just a destination. It’s a gateway.</p><p>The venue is the physical front door to a larger world of connection, creation and entertainment.</p><p>Come for coffee. Meet someone. Have a drink. Start a conversation. Keep it private—or take it further.</p><p>Through SPILL experiences, conversations and personalities can become content, reach new audiences, build communities and travel far beyond the venue.</p></div>
      </div>
      <div className="whatMedia" data-reveal>
        <video autoPlay muted loop playsInline preload="metadata" poster="/assets/spill/home/what-is-spill-poster.jpg" aria-hidden="true"><source src="/assets/spill/home/what-is-spill.mp4" type="video/mp4" />Your browser does not support background video.</video>
      </div>
    </section>

    <section className="ecosystemSection" aria-labelledby="ecosystem-heading">
      <div className="ecosystemIntro" data-reveal>
        <p className="sectionNumber">The SPILL ecosystem</p>
        <h2 id="ecosystem-heading">One room.<br /><em>An entire ecosystem.</em></h2>
        <p className="ecosystemFormula">Venues <i>→</i> Experiences <i>→</i> Content <i>→</i> Creators <i>→</i> Community <i>→</i> Culture <i>→</i> Streaming <i>→</i> <strong>↻</strong></p>
      </div>
      <div className="ecosystemViewport" data-reveal>
        <div className="ecosystemTrack">
          {[0, 1].map((loopIndex) => <div className="ecosystemSequence" key={loopIndex} aria-hidden={loopIndex === 1}>
            {ecosystemStages.map((stage, index) => <article className="ecosystemCard" id={loopIndex === 0 ? `ecosystem-${index}` : undefined} key={`${stage.title}-${loopIndex}`}>
              <div className="ecosystemCardMedia">
                <Image src={stage.image} alt="" fill sizes="(max-width: 760px) 78vw, 30vw" />
              </div>
              <div className="ecosystemCardVeil" />
              <div className="ecosystemCardCopy"><span>{String(index + 1).padStart(2, "0")}</span><h3>{stage.title}</h3><p>{stage.detail}</p></div>
              {loopIndex === 0 ? <a className="ecosystemNext" href={`#ecosystem-${index === ecosystemStages.length - 1 ? 0 : index + 1}`} aria-label={index === ecosystemStages.length - 1 ? "Return to Venues" : `Continue to ${ecosystemStages[index + 1].title}`}>{index === ecosystemStages.length - 1 ? "↻" : "→"}</a> : <b aria-hidden="true">{index === ecosystemStages.length - 1 ? "↻" : "→"}</b>}
            </article>)}
          </div>)}
        </div>
      </div>
      <p className="ecosystemStatement" data-reveal>Real-world experiences create digital stories. Digital stories build audiences. Audiences discover SPILL. <span>And the cycle begins again.</span></p>
    </section>

    <section className="masterSection journeySection" id="journey">
      <div className="sectionTopline"><div className="sectionNumber">02 / The SPILL Journey</div><p>Private connection → public platform</p></div>
      <div className="journeyIntro" data-reveal><h2>How far do you<br />want to <em><SpillWordmark /></em>?</h2></div>
      <div className="journeyGrid">
        {journey.map((step) => <article className="journeyCard" key={step.name}>
          <div className="journeyCardMedia"><Image src={step.image} alt="" fill sizes="(max-width: 760px) 100vw, (max-width: 1100px) 50vw, 20vw" /></div>
          <div className="journeyCardContent"><div className="journeyCardTop"><span>{step.number}</span><strong>{step.verb}</strong><i aria-hidden="true" /></div>
          <div className="journeyCardBody"><h3><BrandedText text={step.name} /></h3><div className="journeyDetail"><p>{step.copy}</p><Link href={step.href}>{step.cta} <span>↗</span></Link></div></div></div>
        </article>)}
      </div>
    </section>

    <section className="masterSection connectionsSection" id="connections">
      <div className="connectionsVisual" data-reveal>
        <video autoPlay muted loop playsInline preload="metadata" poster="/assets/spill/home/spill-42-poster.jpg" aria-hidden="true"><source src="/assets/spill/home/spill-42.mp4" type="video/mp4" />Your browser does not support background video.</video>
        <span>42 prompts.<br />Countless conversations.</span>
      </div>
      <div className="connectionsCopy" data-reveal><div className="sectionNumber">03 / SPILL Connections</div><h2>Real connection<br />starts <em>offline.</em></h2><p>SPILL Connections uses SPILL 42 to make starting a better conversation easier. Sit down with someone you know—or someone you have just met—and move beyond small talk.</p><div className="tagCloud"><span>Dates</span><span>Friends</span><span>Coworkers</span><span>New people</span><span>One table</span></div><Link className="textLink" href="/spill-42">Discover SPILL 42 <span>→</span></Link></div>
    </section>

    <section className="hospitalitySection" id="hospitality">
      <div className="hospitalityCopy" data-reveal><div className="sectionNumber">04 / Hospitality</div><h2>Coffee. Cocktails.<br />Food. <em>Conversation.</em></h2><p>One continuous café-bar experience, moving naturally from daytime coffee culture into a richer evening atmosphere.</p><div className="offeringList">{["Coffee", "Tea", "Food", "Cocktails", "Beer + Wine", "Signature SPILL Drinks"].map((item, index) => <span key={item}><b>0{index + 1}</b>{item}</span>)}</div><div className="inlineActions"><Link className="textLink" href="/saigon/menu">Saigon menu <span>→</span></Link><Link className="textLink mutedLink" href="/tokyo/menu">Tokyo menu · coming soon</Link></div></div>
      <div className="hospitalityGallery" data-reveal><video autoPlay muted loop playsInline preload="metadata" poster="/assets/spill/menu/hero-poster.jpg" aria-hidden="true"><source src="/assets/spill/menu/hero.mp4" type="video/mp4" />Your browser does not support background video.</video></div>
    </section>

    <section className="dayNightSection" aria-labelledby="day-night-heading">
      <div className="dayNightTitle" data-reveal><div className="sectionNumber">05 / Day to night</div><h2 id="day-night-heading">One <SpillWordmark tone="dark" />.<br /><em>Different energy.</em></h2></div>
      <div className="dayNightGrid">
        <article className="dayPanel"><Image src="/assets/spill/concept-exterior-day.webp" alt="SPILL café bar during the day" fill sizes="(max-width: 760px) 100vw, 50vw" /><div><span>07:00</span><h3>Day</h3><p>Bright. Open. Social.</p><small>Coffee, food, meetings, creator work, introductions, and easy conversation.</small></div></article>
        <article className="nightPanel"><Image src="/assets/spill/home/venue-night.jpg" alt="SPILL café bar at night" fill sizes="(max-width: 760px) 100vw, 50vw" /><div><span>19:00</span><h3>Night</h3><p>Richer. Intimate. Alive.</p><small>Cocktails, livestreams, audience moments, performances, and social discovery.</small></div></article>
      </div>
      <p className="dayNightNote">The atmosphere changes. <span>The SPILL experience continues.</span></p>
    </section>

    <section className="masterSection livestreamSection" id="livestream">
      <div className="livestreamMedia" data-reveal><video autoPlay muted loop playsInline preload="metadata" poster="/assets/spill/home/livestream-promotion-poster.jpg" aria-hidden="true"><source src="/assets/spill/home/livestream-promotion.mp4" type="video/mp4" />Your browser does not support background video.</video><div className="onAir"><i /> On air</div></div>
      <div className="livestreamCopy" data-reveal><div className="sectionNumber">06 / SPILL Livestream</div><h2>Got something<br /><em>to show?</em></h2><p>SPILL Livestream gives everyday people, creators, founders, businesses, performers, and emerging talent a professional public platform.</p><p>Launch something. Perform. Tell a story. Express an opinion. Show your talent. Give people a reason to discover you.</p><strong>Professional production. Real audience. Instant visibility.</strong><Link className="textLink" href="/livestream">Explore SPILL Livestream <span>→</span></Link></div>
    </section>

    <section className="podcastSection" id="podcast">
      <div className="podcastHeading" data-reveal><div className="sectionNumber">07 / SPILL Podcast</div><h2>Some stories<br />deserve <em>more time.</em></h2><p>Bring your idea. SPILL helps turn it into a great production—and gives it room to grow.</p></div>
      <div className="podcastMedia" data-reveal><video autoPlay muted loop playsInline poster="/assets/spill/home/podcast-poster.jpg"><source src="/assets/spill/home/podcast.mp4" type="video/mp4" /></video><span>Long-form conversations,<br />professionally produced.</span></div>
      <div className="podcastChoices">
        <article data-reveal><span>01</span><h3>Create your podcast</h3><p>Bring your concept or existing show to SPILL for development, recording, editing, content creation, and ongoing support.</p><Link href="/podcast#inquiry">Produce with SPILL →</Link></article>
        <article data-reveal><span>02</span><h3>Be part of <SpillWordmark tone="dark" /> Podcast</h3><p>Exceptional people and stories discovered through the wider SPILL ecosystem can be invited back for deeper conversations.</p><a href="https://www.youtube.com/@spillsaigon" target="_blank" rel="noreferrer">Watch SPILL Podcast ↗</a></article>
      </div>
    </section>

    <section className="masterSection originalsSection" id="originals">
      <div className="originalsIntro" data-reveal><div className="sectionNumber">08 / Premium SPILL-developed media</div><h2><SpillWordmark /><br /><em>Originals.</em></h2><p>The strongest ideas from across the SPILL ecosystem can grow into shows, series, stories, interviews, documentaries, performances, and media properties for YouTube and wider distribution.</p><a className="button primary" href="https://www.youtube.com/@spillsaigon" target="_blank" rel="noreferrer">Watch SPILL Originals ↗</a></div>
      <div className="originalsBoard" aria-label="SPILL Originals concepts">
        {["Local Legends", "Founders at SPILL", "42 Questions", "The Big SPILL"].map((name, index) => <article key={name}><span>0{index + 1}</span><h3><BrandedText text={name} /></h3><small>In development</small></article>)}
      </div>
    </section>

    <section className="masterSection storySection" aria-labelledby="story-heading">
      <div className="storyIntro" data-reveal><div className="sectionNumber">09 / The physical-to-digital flywheel</div><h2 id="story-heading">One story.<br /><em>Many possibilities.</em></h2></div>
      <div className="storyPath">{storyPath.map(({ title, detail, image }, index) => <article key={title}><div className="storyPathMedia"><Image src={image} alt="" fill sizes="(max-width: 760px) 35vw, 260px" /></div><span>0{index + 1}</span><div className="storyPathCopy"><h3><SpillWordmark /> {title}</h3><p>{detail}</p></div>{index < storyPath.length - 1 && <b aria-hidden="true">↓</b>}</article>)}</div>
      <div className="distributionRail"><span>Clips</span><i>→</i><span>YouTube</span><i>→</i><span>Social</span><i>→</i><span>Audience</span><i>→</i><span>Events</span><i>→</i><span>Partnerships</span><i>→</i><strong>New people at SPILL</strong></div>
    </section>

    <section className="peopleSection" id="people">
      <div className="peopleHeading" data-reveal><div className="sectionNumber">10 / People of SPILL</div><h2>Interesting people<br />are <em>everywhere.</em></h2><p>SPILL gives them somewhere to be discovered.</p></div>
      <div className="peopleGrid">
        <article className="peopleFeature"><Image src="/assets/spill/home/people-founders-creators-professionals.png" alt="Founders, creators and professionals connecting at SPILL" fill sizes="(max-width: 760px) 100vw, 50vw" /><span>Founders · Creators · Professionals</span></article>
        <article><Image src="/assets/spill/home/people-visitors-connections.png" alt="A SPILL café bar ready for visitors and new connections" fill sizes="(max-width: 760px) 100vw, 25vw" /><span>Visitors · New connections</span></article>
        <article><Image src="/assets/spill/home/people-everyday-stories.png" alt="A SPILL table set for everyday people and great stories" fill sizes="(max-width: 760px) 100vw, 25vw" /><span>Everyday people · Great stories</span></article>
      </div>
      <div className="peopleLabels"><span>Creators</span><span>Founders</span><span>Chefs</span><span>Musicians</span><span>Artists</span><span>Businesses</span><span>Visitors</span></div>
    </section>

    <EventsProgramming />

    <section className="masterSection chooseSection" id="future-locations">
      <div className="chooseHeading" data-reveal><div className="sectionNumber">12 / Choose your SPILL</div><h2>Where will<br />you <em><SpillWordmark /></em>?</h2></div>
      <div className="chooseGrid">
        <Link className="cityCard saigonCard" href="/saigon"><Image src="/assets/spill/concept-exterior-day.webp" alt="SPILL Saigon" fill sizes="(max-width: 900px) 100vw, 50vw" /><div className="cityCardVeil" /><div><span>01 / Launching soon</span><h3><SpillWordmark /> <span className="cityName">Saigon</span></h3><p>The original. Born in Vietnam.</p><b>Explore SPILL Saigon →</b></div></Link>
        <Link className="cityCard tokyoCard" href="/tokyo"><div><span>02 / Coming next</span><h3><SpillWordmark /> <span className="cityName">Tokyo</span></h3><p>Same SPILL system. A new local expression.</p><b>Explore SPILL Tokyo →</b></div></Link>
        <div className="futureCard"><span>03 / Future locations</span><h3>Hanoi · Bangkok</h3><h4>+ What comes next</h4><p>A global system, always rooted in local community and culture.</p><Link href="/partner">Discover what’s next →</Link></div>
      </div>
    </section>

    <section className="brandStatement">
      <div className="brandStatementMark" aria-hidden="true">“</div>
      <div data-reveal><p>Karaoke gave everyday people the microphone.</p><h2><SpillWordmark tone="dark" /> gives everyday<br />people the <em>platform.</em></h2><p>Come with followers or without them. Come with a business, a story, an idea, a question, or nothing planned at all. Talk. Listen. Connect. Participate. Discover what happens next.</p></div>
    </section>

    <section className="finalCta">
      <Image src="/assets/spill/home/venue-night.jpg" alt="" fill sizes="100vw" /><div className="finalCtaVeil" />
      <div data-reveal><p className="eyebrow">What are you doing tonight?</p><h2>Let’s go<br /><em><SpillWordmark /></em>.</h2><p>Come for a coffee. Stay for a drink. Meet someone. Start a conversation. Join the audience. Take the mic. Watch something happen—or make something happen.</p><div className="actions"><a className="button primary" href="#locations">Find your SPILL</a><a className="button secondary" href="#journey">Explore the experience</a></div></div>
    </section>
  </main>;
}
