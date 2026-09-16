"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export function HomeAnimations() {
  useGSAP(() => {
    const media = gsap.matchMedia();
    media.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.timeline({ defaults: { ease: "power3.out" } })
        .from(".globalHero .masterHeroMedia", { scale: 1.1, opacity: 0, duration: 1.6, ease: "power2.out" })
        .from(".globalHero .siteHeader", { y: -24, opacity: 0, duration: 0.75 })
        .from(".globalHero .masterHeroContent > *", { y: 44, opacity: 0, duration: 0.9, stagger: 0.12 }, "-=0.35")
        .from(".heroCityRail a", { y: 18, opacity: 0, duration: 0.55, stagger: 0.08 }, "-=0.4");

      gsap.to(".globalHero .masterHeroContent", { yPercent: 10, opacity: 0.4, ease: "none", scrollTrigger: { trigger: ".globalHero", start: "top top", end: "bottom top", scrub: 0.8 } });
      gsap.utils.toArray<HTMLElement>("[data-reveal]").forEach((element) => gsap.from(element, { y: 64, opacity: 0, duration: 1, ease: "power3.out", scrollTrigger: { trigger: element, start: "top 86%", once: true } }));
      gsap.from(".journeyCard", { y: 70, opacity: 0, duration: 0.8, stagger: 0.09, ease: "power3.out", scrollTrigger: { trigger: ".journeyGrid", start: "top 80%", once: true } });
    });
    return () => media.revert();
  });
  return null;
}
