import type { ReactNode } from "react";
import { GlobalHeader } from "./global-header";
import { LocalHeader } from "./local-header";
import { BrandedText } from "./brand-text";
import type { Location } from "@/lib/site-data";
import { MailInquiryForm } from "./mail-inquiry-form";

export function InquiryPage({ eyebrow, title, description, location, children, formTitle, interests }: { eyebrow: string; title: string; description: string; location?: Location; children: ReactNode; formTitle: string; interests: string[] }) {
  return <main className="inquiryPage">
    <div className="portalHeaderWrap">{location ? <LocalHeader location={location} /> : <GlobalHeader />}</div>
    <section className="portalHero inquiryHero"><p className="eyebrow">{eyebrow}</p><h1><BrandedText text={title} /></h1><p>{description}</p></section>
    <section className="inquiryBody"><div className="inquiryCopy">{children}</div><MailInquiryForm formTitle={formTitle} interests={interests} subject={`${title} enquiry`} investor={interests.some((interest) => interest.toLowerCase().includes("invest"))} /></section>
  </main>;
}
