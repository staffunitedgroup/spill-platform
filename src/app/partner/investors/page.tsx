import { PortalPage } from "@/components/portal-page";

const sections = [
  { title: "Investor Overview", text: "A public introduction to SPILL, the opportunity, current locations, leadership, and ways to participate." },
  { title: "Business Model", text: "A diversified model spanning food and beverage, events, SPILL 42, media, sponsorships, merchandise, franchising, and licensing." },
  { title: "SPILL Ecosystem", text: "Physical venues create experiences. Experiences create content. Content grows audiences—and brings people back to SPILL." },
  { title: "Expansion Strategy", text: "A repeatable global platform with locally relevant venues, programming, creators, and partnerships." },
  { title: "Investor Enquiry", text: "Start a confidential conversation with the SPILL team about current and future investment opportunities.", href: "/contact#investor-enquiry" },
];
export default function Page() { return <PortalPage eyebrow="Partner with SPILL · Investors" title="Invest in the ecosystem" description="SPILL is building a new kind of hospitality and media platform, with multiple connected revenue streams and a model designed to travel." sections={sections} note="Detailed financial information, unit economics, investment terms, and data-room documents are shared only through a restricted investor process." />; }
