"use client";

import Image from "next/image";
import { useRef, useState } from "react";

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

export function MenuBook() {
  const track = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const goTo = (index: number) => {
    const next = Math.max(0, Math.min(menuPages.length - 1, index));
    const element = track.current?.children[next] as HTMLElement | undefined;
    element?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
    setActive(next);
  };

  return <section className="menuBook" aria-label="Full SPILL Saigon menu">
    <div className="menuBookTop"><div><p className="eyebrow">The full menu</p><h2>Eight pages.<br />One menu.</h2></div><p>Hover a category, use the arrows, or swipe the menu like a real book.</p></div>
    <nav className="menuBookTabs" aria-label="Choose a menu page">{menuPages.map((page, index) => <button className={active === index ? "active" : ""} onClick={() => goTo(index)} onMouseEnter={() => goTo(index)} aria-current={active === index ? "page" : undefined} key={page.slug}><span>{String(index + 1).padStart(2, "0")}</span>{page.label}</button>)}</nav>
    <div className="menuBookStage">
      <button className="menuBookArrow previous" onClick={() => goTo(active - 1)} disabled={active === 0} aria-label="Previous menu page">←</button>
      <div className="menuBookTrack" ref={track} onScroll={(event) => { const element = event.currentTarget; const next = Math.round(element.scrollLeft / element.clientWidth); if (next !== active) setActive(next); }}>
        {menuPages.map((page, index) => <article id={page.slug} className="menuBookPage" key={page.slug}><div><span>{String(index + 1).padStart(2, "0")}</span><strong>{page.label}</strong><small>{index + 1} / {menuPages.length}</small></div><Image src={page.src} alt={`SPILL Saigon ${page.label} menu`} width={940} height={1670} priority={index === 0} sizes="(max-width: 900px) 92vw, 62vw" /></article>)}
      </div>
      <button className="menuBookArrow next" onClick={() => goTo(active + 1)} disabled={active === menuPages.length - 1} aria-label="Next menu page">→</button>
    </div>
    <div className="menuBookProgress" aria-hidden="true"><span style={{ width: `${((active + 1) / menuPages.length) * 100}%` }} /></div>
  </section>;
}
