import Image from "next/image";

const stages = [
  { title: "Venues", detail: "The physical front door.", image: "/assets/spill/home/ecosystem-venues.png" },
  { title: "Experiences", detail: "Connection · Confessional · Livestream · Podcast · Originals", image: "/assets/spill/home/ecosystem-experiences.png" },
  { title: "Content", detail: "Vertical clips · livestreams · interviews · social posts", image: "/assets/spill/home/ecosystem-content.png" },
  { title: "Creators", detail: "Faces, voices and ideas worth discovering.", image: "/assets/spill/home/ecosystem-creators.png" },
  { title: "Community", detail: "Comments · shares · audiences · people returning", image: "/assets/spill/home/ecosystem-community.png" },
  { title: "Culture", detail: "Moments spreading outside SPILL.", image: "/assets/spill/home/ecosystem-culture.png" },
  { title: "SPILL Streaming", detail: "SPILL on TV · mobile · tablet", image: "/assets/spill/home/ecosystem-streaming.png" },
  { title: "Back to SPILL", detail: "Digital discovery becomes real-world connection.", image: "/assets/spill/home/ecosystem-back-to-spill.png" },
] as const;

export function EcosystemCarousel() {
  return <div className="ecosystemCarousel" data-reveal>
    <div className="ecosystemViewport" aria-label="The SPILL ecosystem. Swipe to explore on touch screens.">
      <div className="ecosystemTrack">
        {[0, 1].map((loop) => <div className="ecosystemSequence" aria-hidden={loop === 1} key={loop}>{stages.map((stage, index) => <article className="ecosystemCard" key={`${loop}-${stage.title}`}>
          <div className="ecosystemCardMedia"><Image src={stage.image} alt="" fill sizes="(max-width: 760px) 82vw, 31vw" /></div>
          <div className="ecosystemCardVeil" />
          <div className="ecosystemCardCopy"><span>{String(index + 1).padStart(2, "0")}</span><h3>{stage.title}</h3><p>{stage.detail}</p></div>
        </article>)}</div>)}
      </div>
    </div>
  </div>;
}
