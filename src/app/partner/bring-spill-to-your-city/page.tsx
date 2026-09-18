import { InquiryPage } from "@/components/inquiry-page";

const interests = ["Owning / operating SPILL", "Developing multiple SPILL locations", "Property / real estate partnership", "Investing in SPILL", "Brand partnership", "Other"];
export default function Page() { return <InquiryPage eyebrow="Franchising · Expansion" title="Bring SPILL to your city" description="SPILL is building a global network of locations with exceptional local partners." formTitle="Start here" interests={interests}>
  <p className="eyebrow">More than a café bar</p><h2>A complete revenue ecosystem.</h2><p>SPILL combines hospitality, events, entertainment, content, creators, community, and brand partnerships in one connected venue model.</p>
  <ul><li>Own or operate a flagship local venue</li><li>Develop multiple locations across a market</li><li>Bring property, local expertise, or investment</li><li>Build culture locally with the support of a global platform</li></ul>
</InquiryPage>; }
