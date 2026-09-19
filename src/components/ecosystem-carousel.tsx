"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

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
  const viewport = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  const goTo = useCallback((index: number) => {
    const next = (index + stages.length) % stages.length;
    const card = viewport.current?.children[next] as HTMLElement | undefined;
    card?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
    setActive(next);
  }, []);

  useEffect(() => {
    const rail = viewport.current;
    if (!rail) return;
    const cards = Array.from(rail.children) as HTMLElement[];
    const observer = new IntersectionObserver((entries) => {
      const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (visible) setActive(cards.indexOf(visible.target as HTMLElement));
    }, { root: rail, threshold: [0.55, 0.8] });
    cards.forEach((card) => observer.observe(card));
    return () => observer.disconnect();
  }, []);

  return <div className="ecosystemCarousel" data-reveal>
    <div className="ecosystemControls" aria-label="SPILL ecosystem carousel controls">
      <button type="button" onClick={() => goTo(active - 1)} aria-label="Previous ecosystem stage">←</button>
      <span>{String(active + 1).padStart(2, "0")} / {String(stages.length).padStart(2, "0")}</span>
      <button type="button" onClick={() => goTo(active + 1)} aria-label="Next ecosystem stage">→</button>
    </div>
    <div className="ecosystemViewport" ref={viewport}>
      {stages.map((stage, index) => <article className="ecosystemCard" key={stage.title}>
        <div className="ecosystemCardMedia"><Image src={stage.image} alt="" fill sizes="(max-width: 760px) 82vw, 31vw" /></div>
        <div className="ecosystemCardVeil" />
        <div className="ecosystemCardCopy"><span>{String(index + 1).padStart(2, "0")}</span><h3>{stage.title}</h3><p>{stage.detail}</p></div>
        <button className="ecosystemNext" type="button" onClick={() => goTo(index + 1)} aria-label={index === stages.length - 1 ? "Return to Venues" : `Continue to ${stages[index + 1].title}`}>{index === stages.length - 1 ? "↻" : "→"}</button>
      </article>)}
    </div>
  </div>;
}
