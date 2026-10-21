"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

// Lines up cards that sit side by side: number with number, title with title,
// text with text, button with button — even when one card's title or text
// wraps onto more lines than its neighbour's.
//
// For each group below, cards in the same row get the same height for every
// listed part (in order). Cards stacked in one column on phones are left alone.
type Group = { cards: string; parts: string[] };

const GROUPS: Group[] = [
  // Home: "One room. An entire ecosystem." carousel
  { cards: ".ecosystemCard", parts: [".ecosystemCardCopy h3", ".ecosystemCardCopy p"] },
  // Home: "How far do you want to SPILL?" journey cards
  { cards: ".journeyCard", parts: [".journeyCardBody h3", ".journeyDetail p", ".journeyDetail a"] },
  // Home: podcast "Create your podcast / Be part of SPILL Podcast"
  { cards: ".podcastChoices > article", parts: ["h3", "p", "a"] },
  // Home: SPILL Originals board
  { cards: ".originalsBoard > article", parts: ["h3"] },
  // About, Careers, Contact, Create, Partner, Press, What's On, Book, Visit…
  { cards: ".portalCard", parts: [":scope > div > .eyebrow", ":scope > div > h2", ":scope > div > p:not(.eyebrow)", ":scope > div"] },
  // Location home (e.g. /saigon) section cards
  { cards: ".localHomeSections > a", parts: [":scope > div > span", ":scope > div > h2", ":scope > div > p", ":scope > div"] },
  // Livestream
  { cards: ".liveBusinessCard", parts: [".liveBusinessCardTop", ".liveBusinessCardBody h3", ".liveBusinessCardBody p"] },
  { cards: ".liveOutputCard", parts: ["h3"] },
  { cards: ".liveFlywheelMiniCard", parts: ["h3"] },
  { cards: ".liveSponsorGrid > article", parts: ["h3", "p"] },
  { cards: ".livePillarGrid > article", parts: ["h3", "p"] },
  // Confessional
  { cards: ".confMetricGrid > article", parts: ["h3"] },
  { cards: ".confPriceTable > article", parts: ["h3", "strong", "p"] },
  { cards: ".confCities > div", parts: ["h3"] },
  { cards: ".confSponsorIdeas > article", parts: ["h3"] },
  { cards: ".confConsentGrid > article", parts: ["h3", "p"] },
  // Podcast
  { cards: ".podPathGrid > article", parts: [":scope > span", "h3", "p", "ul", "a"] },
  { cards: ".podEntry > article", parts: [":scope > span", "h2", "p", "a"] },
  { cards: ".podProductionGrid > div", parts: ["p"] },
  { cards: ".podContentFlow > div", parts: ["strong"] },
  { cards: ".podBenefitsGrid > article", parts: ["h3", "p"] },
  { cards: ".podCapabilityGrid > article", parts: ["h3", "p"] },
  // Investors
  { cards: ".investorLater article", parts: ["h3", "p"] },
];

function align() {
  for (const group of GROUPS) {
    const cards = [...document.querySelectorAll<HTMLElement>(group.cards)];
    if (cards.length < 2) continue;

    // Start from natural heights every time (the layout may have changed).
    for (const card of cards) {
      for (const part of group.parts) {
        const el = card.querySelector<HTMLElement>(part);
        if (el) el.style.minHeight = "";
      }
    }

    // Rows = cards with the same parent and the same top (offsetTop ignores
    // the slide-in animations, which move cards with transforms).
    const rows = new Map<string, HTMLElement[]>();
    const parents = new Map<Element, number>();
    for (const card of cards) {
      if (card.offsetParent === null) continue; // hidden
      const parent = card.parentElement;
      if (!parent) continue;
      if (!parents.has(parent)) parents.set(parent, parents.size);
      const key = `${parents.get(parent)}:${Math.round(card.offsetTop / 4)}`;
      const row = rows.get(key) ?? [];
      row.push(card);
      rows.set(key, row);
    }

    for (const row of rows.values()) {
      if (row.length < 2) continue;
      for (const part of group.parts) {
        const els = row
          .map((card) => card.querySelector<HTMLElement>(part))
          .filter((el): el is HTMLElement => Boolean(el));
        if (els.length < 2) continue;
        // offsetHeight ignores transforms (slide/scale-in animations).
        const tallest = Math.max(...els.map((el) => el.offsetHeight));
        for (const el of els) el.style.minHeight = `${tallest}px`;
      }
    }
  }
}

export function AlignCards() {
  const pathname = usePathname();

  useEffect(() => {
    let frame = 0;
    const schedule = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(align);
    };
    schedule();
    // And after the page-enter animation has settled.
    const late = window.setTimeout(schedule, 800);
    // Again once web fonts have loaded (they change line breaks).
    document.fonts?.ready.then(schedule).catch(() => {});
    window.addEventListener("resize", schedule);
    window.addEventListener("load", schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(late);
      window.removeEventListener("resize", schedule);
      window.removeEventListener("load", schedule);
    };
  }, [pathname]);

  return null;
}
