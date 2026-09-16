"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export function LivestreamAnimations() {
  useGSAP(() => {
    const media = gsap.matchMedia();

    media.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.timeline({ defaults: { ease: "power3.out" } })
        .from(".liveHeroPoster", { x: 55, opacity: 0, duration: 1.15 })
        .from(".liveHero .siteHeader", { y: -20, opacity: 0, duration: 0.65 }, "-=.85")
        .from(".liveHeroCopy > *", { y: 38, opacity: 0, duration: 0.78, stagger: 0.09 }, "-=.5")
        .from(".liveTicker > *", { opacity: 0, duration: 0.4, stagger: 0.04 }, "-=.25");

      gsap.to(".liveHeroPoster img", {
        yPercent: 6,
        ease: "none",
        scrollTrigger: { trigger: ".liveHero", start: "top top", end: "bottom top", scrub: 0.8 },
      });

      gsap.utils.toArray<HTMLElement>(".livePage [data-live-reveal]").forEach((element) => {
        gsap.from(element, {
          y: 56,
          opacity: 0,
          duration: 0.9,
          ease: "power3.out",
          scrollTrigger: { trigger: element, start: "top 87%", once: true },
        });
      });

      gsap.from(".liveFlywheelStep", {
        x: -28,
        opacity: 0,
        duration: 0.55,
        stagger: 0.055,
        ease: "power2.out",
        scrollTrigger: { trigger: ".liveFlywheel", start: "top 80%", once: true },
      });
    });

    return () => media.revert();
  });

  return null;
}
