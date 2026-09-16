import { notFound } from "next/navigation";
import { LocalHeader } from "@/components/local-header";
import { getLocation, localNavigation, locations } from "@/lib/site-data";

const content: Record<string, [string, string, string]> = {
  "whats-on": ["Tonight · This week · Upcoming", "What’s on", "Events, SPILL 42, live experiences, and everything happening at this SPILL."],
  menu: ["All day · Coffee · Food · Cocktails", "Eat + Drink", "Coffee through cocktails, with food and signatures made for long conversations."],
  spill42: ["Ask · Do · Notice · Dare", "SPILL 42", "The signature in-venue experience designed to help people connect in the real world."],
  create: ["Podcast · Livestream · Perform", "Create at SPILL", "Record, broadcast, perform, host, collaborate, and share your story from SPILL."],
  book: ["One place to book", "Book SPILL", "Reserve a table, podcast, livestream, confessional, event, venue, or brand experience."],
  visit: ["Location · Hours · Directions", "Visit", "Everything you need before you arrive, including access, transport, contact details, and house information."],
};

export function generateStaticParams() { return locations.flatMap(({ slug }) => localNavigation.filter(({ path }) => path).map(({ path }) => ({ location: slug, section: path }))); }

export default async function LocalSection({ params }: { params: Promise<{ location: string; section: string }> }) {
  const { location: slug, section } = await params;
  const location = getLocation(slug); const sectionContent = content[section];
  if (!location || !sectionContent) notFound();
  return <main className="interiorPage"><LocalHeader location={location} /><section className="pageIntro"><p className="eyebrow">{location.name} · {sectionContent[0]}</p><h1>{sectionContent[1]}</h1><p>{sectionContent[2]}</p>{location.status === "coming-soon" && <span className="statusPill">Coming soon</span>}</section></main>;
}
