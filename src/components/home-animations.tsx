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
        .from(".globalHero .heroMedia", { scale: 1.12, opacity: 0, duration: 1.6, ease: "power2.out" })
        .from(".globalHero .siteHeader", { y: -24, opacity: 0, duration: 0.75 })
        .from(".globalHero .heroContent > *", { y: 44, opacity: 0, duration: 0.9, stagger: 0.12 }, "-=0.35")
        .from(".ecosystemRail span", { y: 14, opacity: 0, duration: 0.55, stagger: 0.055 }, "-=0.4");

      gsap.to(".globalHero .heroContent", { yPercent: 13, opacity: 0.45, ease: "none", scrollTrigger: { trigger: ".globalHero", start: "top top", end: "bottom top", scrub: 0.8 } });
      gsap.utils.toArray<HTMLElement>("[data-reveal]").forEach((element) => gsap.from(element, { y: 64, opacity: 0, duration: 1, ease: "power3.out", scrollTrigger: { trigger: element, start: "top 86%", once: true } }));
      gsap.from(".locationCard", { xPercent: -6, opacity: 0, duration: 0.85, stagger: 0.13, ease: "power3.out", scrollTrigger: { trigger: ".locationGrid", start: "top 82%", once: true } });
      gsap.from(".experienceGrid article", { y: 70, opacity: 0, duration: 0.8, stagger: 0.1, ease: "power3.out", scrollTrigger: { trigger: ".experienceGrid", start: "top 80%", once: true } });
    });
    return () => media.revert();
  });
  return null;
}
