"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export function PodcastAnimations() {
  useGSAP(() => {
    const media = gsap.matchMedia();

    media.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.timeline({ defaults: { ease: "power3.out" } })
        .from(".podHeroImage", { scale: 1.08, opacity: 0, duration: 1.5, ease: "power2.out" })
        .from(".podHero .siteHeader", { y: -20, opacity: 0, duration: 0.7 }, "-=1")
        .from(".podHeroContent > *", { y: 45, opacity: 0, duration: 0.85, stagger: 0.1 }, "-=0.45")
        .from(".podHeroMeta > *", { y: 16, opacity: 0, duration: 0.55, stagger: 0.08 }, "-=0.35");

      gsap.to(".podHeroImage", {
        yPercent: 8,
        ease: "none",
        scrollTrigger: { trigger: ".podHero", start: "top top", end: "bottom top", scrub: 0.8 },
      });

      gsap.utils.toArray<HTMLElement>(".podcastPage [data-pod-reveal]").forEach((element) => {
        gsap.from(element, {
          y: 58,
          opacity: 0,
          duration: 0.95,
          ease: "power3.out",
          scrollTrigger: { trigger: element, start: "top 87%", once: true },
        });
      });

      gsap.from(".podJourneyStep", {
        x: -24,
        opacity: 0,
        duration: 0.65,
        stagger: 0.08,
        ease: "power2.out",
        scrollTrigger: { trigger: ".podJourney", start: "top 78%", once: true },
      });
    });

    return () => media.revert();
  });

  return null;
}
