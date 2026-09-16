import Image from "next/image";
import { LocalHeader } from "@/components/local-header";
import type { Location } from "@/lib/site-data";

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

export function MenuPage({ location }: { location: Location }) {
  return <main className="menuPage"><div className="menuHeaderWrap"><LocalHeader location={location} /></div>
    <section className="menuIntro"><div><p className="eyebrow">SPILL Saigon · Concept menu</p><h1>Eat.<br />Drink.<br /><em>SPILL.</em></h1></div><div><p>Coffee through cocktails, familiar favourites, Saigon discoveries, and signatures designed for long conversations.</p><span className="statusPill">Pre-launch menu · Items and pricing may evolve</span></div></section>
    <nav className="menuJump" aria-label="Menu categories">{menuPages.map((page, index) => <a href={`#${page.slug}`} key={page.slug}><span>0{index + 1}</span>{page.label}</a>)}</nav>
    <section className="menuSheets" aria-label="Full SPILL Saigon menu">{menuPages.map((page) => <article id={page.slug} key={page.slug}><div><p className="eyebrow">{page.label}</p><a href="#top">Back to top ↑</a></div><Image src={page.src} alt={`SPILL Saigon ${page.label} menu`} width={940} height={1670} sizes="(max-width: 900px) 100vw, 50vw" /></article>)}</section>
  </main>;
}
