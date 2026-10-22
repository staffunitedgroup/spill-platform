"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

const menuPages = [
  { slug: "coffee", label: "Coffee", src: "/assets/spill/menu/coffee.webp" },
  { slug: "matcha-tea", label: "Matcha + Tea", src: "/assets/spill/menu/matcha-tea.webp" },
  { slug: "fruit-yogurt", label: "Fruit + Yogurt", src: "/assets/spill/menu/fruit-yogurt.webp" },
  { slug: "bite-sweets", label: "Bites + Sweets", src: "/assets/spill/menu/bite-sweets.webp" },
  { slug: "beer", label: "Beer", src: "/assets/spill/menu/beer.webp" },
  { slug: "wine", label: "Wine", src: "/assets/spill/menu/wine.webp" },
  { slug: "spill-signature", label: "SPILL Signature", src: "/assets/spill/menu/spill-signature.webp" },
  { slug: "essentials", label: "Essentials + Extras", src: "/assets/spill/menu/extra-page.webp" },
];

/**
 * True only with a real mouse (no hover-to-turn on phones and tablets).
 * Hover uses mousemove, not mouseenter: the tab bar scrolls itself to the
 * active tab, and tabs sliding under a still cursor must not turn the page.
 */
function canHover() {
  return typeof window !== "undefined" && window.matchMedia("(hover: hover) and (pointer: fine)").matches;
}

export function MenuBook() {
  const track = useRef<HTMLDivElement>(null);
  const tabs = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);
  // While a tab tap is gliding the pages, ignore the scroll events it causes,
  // so the highlight doesn't flick through every page in between.
  const gliding = useRef<number | null>(null);
  const frame = useRef(0);

  // Keep the active tab in view inside the tab bar (moves only the bar, never the page).
  useEffect(() => {
    const bar = tabs.current;
    const tab = bar?.children[active] as HTMLElement | undefined;
    if (!bar || !tab) return;
    const left = tab.offsetLeft - (bar.clientWidth - tab.offsetWidth) / 2;
    bar.scrollTo({ left: Math.max(0, left), behavior: "smooth" });
  }, [active]);

  useEffect(() => () => {
    cancelAnimationFrame(frame.current);
    if (gliding.current) window.clearTimeout(gliding.current);
  }, []);

  const goTo = (index: number) => {
    const next = Math.max(0, Math.min(menuPages.length - 1, index));
    const element = track.current;
    const page = element?.children[next] as HTMLElement | undefined;
    const first = element?.children[0] as HTMLElement | undefined;
    if (!element || !page || !first) return;
    setActive(next);
    if (gliding.current) window.clearTimeout(gliding.current);
    gliding.current = window.setTimeout(() => { gliding.current = null; }, 700);
    // Scroll only the page strip sideways (scrollIntoView could also jump the whole page up or down).
    element.scrollTo({ left: page.offsetLeft - first.offsetLeft, behavior: "smooth" });
  };

  const onScroll = () => {
    if (gliding.current) return;
    cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      const element = track.current;
      if (!element) return;
      const pages = Array.from(element.children) as HTMLElement[];
      const first = pages[0];
      const center = element.scrollLeft + element.clientWidth / 2;
      let next = 0;
      let distance = Number.POSITIVE_INFINITY;
      pages.forEach((page, index) => {
        const pageCenter = page.offsetLeft - first.offsetLeft + page.offsetWidth / 2;
        const currentDistance = Math.abs(pageCenter - center);
        if (currentDistance < distance) { distance = currentDistance; next = index; }
      });
      setActive((was) => (was === next ? was : next));
    });
  };

  return <section className="menuBook" aria-label="Full SPILL Saigon menu">
    <div className="menuBookTop"><div className="menuBookConcept"><strong>7 Collections × 6 Selections =&nbsp;42</strong><p>Each collection follows the SPILL 4 + 2 formula: 4 familiar favorites + 2 SPILL selections.</p><p><b>42 selections. Countless conversations.</b></p><span className="statusPill">Pre-launch menu · Items and pricing may evolve</span></div></div>
    <nav className="menuBookTabs" ref={tabs} aria-label="Choose a menu page">{menuPages.map((page, index) => <button type="button" className={active === index ? "active" : ""} onClick={() => goTo(index)} onMouseMove={() => { if (active !== index && canHover()) goTo(index); }} aria-current={active === index ? "page" : undefined} key={page.slug}><span>{String(index + 1).padStart(2, "0")}</span>{page.label}</button>)}</nav>
    <div className="menuBookStage">
      <div className="menuBookTrack" ref={track} onScroll={onScroll}>
        {menuPages.map((page, index) => <article id={page.slug} className="menuBookPage" key={page.slug}><div><span>{String(index + 1).padStart(2, "0")}</span><strong>{page.label}</strong><small>{index + 1} / {menuPages.length}</small></div><Image src={page.src} alt={`SPILL Saigon ${page.label} menu`} width={940} height={1670} priority={index === 0} sizes="(max-width: 900px) 92vw, 62vw" /></article>)}
      </div>
    </div>
    <div className="menuBookProgress" aria-hidden="true"><span style={{ width: `${((active + 1) / menuPages.length) * 100}%` }} /></div>
  </section>;
}
