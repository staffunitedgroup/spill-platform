import { LocalHeader } from "@/components/local-header";
import { MenuBook } from "@/components/menu-book";
import type { Location } from "@/lib/site-data";

export function MenuPage({ location }: { location: Location }) {
  return <main className="menuPage"><div className="menuHeaderWrap"><LocalHeader location={location} /></div>
    <section className="menuIntro">
      <video className="menuHeroMedia" autoPlay muted loop playsInline preload="metadata" poster="/assets/spill/menu/hero-poster.jpg" aria-hidden="true"><source src="/assets/spill/menu/hero.mp4" type="video/mp4" /></video>
      <div className="menuHeroVeil" />
      <div className="menuHeroContent"><div><p className="eyebrow">SPILL Saigon</p><h1>SPILL Signature<br /><em>42 Menu</em></h1></div><div className="menuConceptCopy"><strong>7 Collections × 6 Selections = 42</strong><p>Each collection follows the SPILL 4 + 2 formula:<br />4 familiar favorites + 2 SPILL selections</p><p><b>42 selections. Countless conversations.</b></p><p>SPILL Saigon is one continuous café-bar experience. Coffee, tea, food, beer, wine and cocktails belong to the same venue throughout the day and night; the atmosphere changes, not the business.</p><span className="statusPill">Pre-launch menu · Items and pricing may evolve</span></div></div>
    </section>
    <MenuBook />
  </main>;
}
