import { notFound } from "next/navigation";
import { MenuPage } from "@/components/menu-page";
import { PortalPage } from "@/components/portal-page";
import { getLocation, localNavigation, locations } from "@/lib/site-data";
import { localPageContent } from "@/lib/page-content";

export function generateStaticParams() { return locations.flatMap(({ slug }) => localNavigation.filter(({ path }) => path).map(({ path }) => ({ location: slug, section: path }))); }

export default async function LocalSection({ params }: { params: Promise<{ location: string; section: string }> }) {
  const { location: slug, section } = await params;
  const location = getLocation(slug); const sectionContent = localPageContent[section];
  if (!location || (section !== "menu" && !sectionContent)) notFound();
  if (section === "menu" && slug === "saigon") return <MenuPage location={location} />;
  if (!sectionContent) notFound();
  return <PortalPage location={location} eyebrow={location.name} {...sectionContent} />;
}
