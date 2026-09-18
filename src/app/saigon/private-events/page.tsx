import { InquiryPage } from "@/components/inquiry-page";
import { getLocation } from "@/lib/site-data";

export default function Page() { const location = getLocation("saigon")!; return <InquiryPage eyebrow="SPILL Saigon · Private events" title="Make the room yours" description="Host an event with the hospitality, atmosphere, production capability, and creative energy of SPILL." location={location} formTitle="Plan your event" interests={["Private event", "Corporate event", "Launch / activation", "Panel / workshop", "Performance", "Full venue hire", "Other"]}>
  <p className="eyebrow">Events + venue hire</p><h2>Built to gather people.</h2><p>From intimate conversations to full-room activations, we can shape the layout, food and drink, entertainment, and production around your event.</p>
  <ul><li>Flexible capacities and venue layouts</li><li>Food and beverage packages</li><li>Entertainment and creator options</li><li>AV, podcast, and livestream capability</li><li>Brand and corporate production support</li></ul>
</InquiryPage>; }
