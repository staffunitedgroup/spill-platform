import { GlobalHeader } from "./global-header";
import { BrandedText } from "./brand-text";
export function PageIntro({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return <main className="interiorPage"><GlobalHeader /><section className="pageIntro"><p className="eyebrow">{eyebrow}</p><h1><BrandedText text={title} /></h1><p>{description}</p></section></main>;
}
