import { PortalPage } from "@/components/portal-page";
export default function Page() { return <PortalPage eyebrow="Press + media" title="The SPILL story" description="News, brand resources, venue imagery, and information for editors, journalists, and media partners." sections={[
  { title: "Press Coverage", text: "Selected stories and coverage will be collected here as the network launches." },
  { title: "Press Releases", text: "Official announcements covering locations, partnerships, programming, and expansion." },
  { title: "Leadership", text: "Founder and leadership biographies for profiles, interviews, and speaking opportunities." },
  { title: "Brand Assets", text: "Approved brand descriptions, logos, and venue photography for editorial use." },
  { title: "Media Contact", text: "For press enquiries, interviews, and asset requests, email press@spillcafebar.com." },
]} />; }
