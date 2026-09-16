"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export function ConfessionalAnimations() {
  useGSAP(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) return;

    gsap.from(".confHeroContent > *", {
      opacity: 0,
      y: 34,
      duration: 1,
      stagger: 0.1,
      ease: "power3.out",
    });
    gsap.from(".confHeroRail", { opacity: 0, y: 22, duration: 0.8, delay: 0.45 });
    gsap.to(".confHeroImage", {
      scale: 1.06,
      ease: "none",
      scrollTrigger: { trigger: ".confHero", start: "top top", end: "bottom top", scrub: true },
    });

    gsap.utils.toArray<HTMLElement>("[data-conf-reveal]").forEach((element) => {
      gsap.from(element, {
        opacity: 0,
        y: 38,
        duration: 0.85,
        ease: "power3.out",
        scrollTrigger: { trigger: element, start: "top 87%", once: true },
      });
    });
  }, []);

  return null;
}
