import { GlobalHeader } from "./global-header";
export function PageIntro({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return <main className="interiorPage"><GlobalHeader /><section className="pageIntro"><p className="eyebrow">{eyebrow}</p><h1>{title}</h1><p>{description}</p></section></main>;
}
