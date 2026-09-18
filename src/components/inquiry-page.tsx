import type { ReactNode } from "react";
import { GlobalHeader } from "./global-header";
import { LocalHeader } from "./local-header";
import { BrandedText } from "./brand-text";
import type { Location } from "@/lib/site-data";

export function InquiryPage({ eyebrow, title, description, location, children, formTitle, interests }: { eyebrow: string; title: string; description: string; location?: Location; children: ReactNode; formTitle: string; interests: string[] }) {
  return <main className="inquiryPage">
    <div className="portalHeaderWrap">{location ? <LocalHeader location={location} /> : <GlobalHeader />}</div>
    <section className="portalHero inquiryHero"><p className="eyebrow">{eyebrow}</p><h1><BrandedText text={title} /></h1><p>{description}</p></section>
    <section className="inquiryBody"><div className="inquiryCopy">{children}</div><form className="inquiryForm"><p className="eyebrow">{formTitle}</p>
      <label>I am interested in<select name="interest" defaultValue=""><option value="" disabled>Select an option</option>{interests.map((interest) => <option key={interest}>{interest}</option>)}</select></label>
      <div className="formPair"><label>Name<input name="name" required /></label><label>Company<input name="company" /></label></div>
      <div className="formPair"><label>Email<input name="email" type="email" required /></label><label>Phone<input name="phone" type="tel" /></label></div>
      <div className="formPair"><label>City<input name="city" /></label><label>Country<input name="country" /></label></div>
      <label>Relevant experience<textarea name="experience" rows={3} /></label>
      <div className="formPair"><label>Estimated investment range<input name="investment" /></label><label>Property available?<select name="property" defaultValue=""><option value="" disabled>Select</option><option>Yes</option><option>No</option><option>Exploring</option></select></label></div>
      <label>Message<textarea name="message" rows={5} /></label><button className="button primary" type="submit">Start a conversation <span>↗</span></button>
    </form></section>
  </main>;
}
