import { LocalHeader } from "@/components/local-header";
import { MenuBook } from "@/components/menu-book";
import { SpillWordmark } from "@/components/brand-text";
import type { Location } from "@/lib/site-data";

export function MenuPage({ location }: { location: Location }) {
  return <main className="menuPage"><div className="menuHeaderWrap"><LocalHeader location={location} /></div>
    <section className="menuIntro">
      <video className="menuHeroMedia" autoPlay muted loop playsInline preload="metadata" poster="/assets/spill/menu/hero-poster.jpg" aria-hidden="true"><source src="/assets/spill/menu/hero.mp4" type="video/mp4" /></video>
      <div className="menuHeroVeil" />
      <div className="menuHeroContent"><div><p className="eyebrow">SPILL Saigon · Concept menu</p><h1>Eat<br />Drink<br /><em><SpillWordmark /></em></h1></div><div><p>Coffee through cocktails, familiar favourites, Saigon discoveries, and signatures designed for long conversations.</p><span className="statusPill">Pre-launch menu · Items and pricing may evolve</span></div></div>
    </section>
    <MenuBook />
  </main>;
}
