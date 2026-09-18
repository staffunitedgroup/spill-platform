import Link from "next/link";
import { BrandedText } from "./brand-text";
import { GlobalHeader } from "./global-header";
import { LocalHeader } from "./local-header";
import type { Location } from "@/lib/site-data";

export type PortalSection = {
  title: string;
  text: string;
  detail?: string;
  href?: string;
};

export function PortalPage({
  eyebrow,
  title,
  description,
  sections,
  location,
  note,
  filters,
}: {
  eyebrow: string;
  title: string;
  description: string;
  sections: PortalSection[];
  location?: Location;
  note?: string;
  filters?: Array<{ label: string; name: string; options: string[] }>;
}) {
  return <main className="portalPage">
    <div className="portalHeaderWrap">{location ? <LocalHeader location={location} /> : <GlobalHeader />}</div>
    <section className="portalHero">
      <p className="eyebrow">{eyebrow}</p>
      <h1><BrandedText text={title} /></h1>
      <p>{description}</p>
    </section>
    {filters && <form className="portalFilters" action="/whats-on" method="get" aria-label="Filter what’s on">
      {filters.map((filter) => <label key={filter.name}><span>{filter.label}</span><select name={filter.name}>{filter.options.map((option) => <option value={option === filter.options[0] ? "" : option.toLowerCase().replaceAll(" ", "-")} key={option}>{option}</option>)}</select></label>)}
      <button type="submit">Apply filters <span>→</span></button>
    </form>}
    <nav className="portalJump" aria-label={`${title} sections`}>
      {sections.map((section, index) => <a key={section.title} href={`#${section.title.toLowerCase().replaceAll("+", "and").replaceAll("/", "-").replaceAll(" ", "-").replaceAll("’", "").replaceAll("'", "")}`}><span>{String(index + 1).padStart(2, "0")}</span>{section.title}</a>)}
    </nav>
    <section className="portalGrid">
      {sections.map((section, index) => {
        const id = section.title.toLowerCase().replaceAll("+", "and").replaceAll("/", "-").replaceAll(" ", "-").replaceAll("’", "").replaceAll("'", "");
        return <article id={id} className="portalCard" key={section.title}>
          <span>{String(index + 1).padStart(2, "0")}</span>
          <div><p className="eyebrow">{section.detail ?? eyebrow}</p><h2>{section.title}</h2><p>{section.text}</p>{section.href && <Link href={section.href}>Explore <b>↗</b></Link>}</div>
        </article>;
      })}
    </section>
    {note && <section className="portalStatement"><p>{note}</p></section>}
  </main>;
}
