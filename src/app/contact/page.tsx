import { PortalPage } from "@/components/portal-page";
export default function Page() { return <PortalPage eyebrow="Talk to SPILL" title="Contact" description="Choose the conversation you want to start and we’ll connect you with the right SPILL team." sections={[
  { title: "SPILL Saigon", text: "Venue address and opening hours will be announced ahead of launch. Email hello@spillcafebar.com or follow @spillsaigon." },
  { title: "General Enquiries", text: "Questions about SPILL, locations, events, bookings, and the wider network." },
  { title: "Partner Enquiry", text: "Brands, sponsors, companies, organizations, property partners, and venue opportunities.", href: "/partner" },
  { title: "Investor Enquiry", text: "Start a confidential conversation about investment and expansion.", href: "/partner/investors" },
  { title: "Press Enquiry", text: "For interviews, press materials, photography, and media information.", href: "/press" },
]} />; }
