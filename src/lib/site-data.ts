export type LocationSlug = "saigon" | "hanoi" | "tokyo" | "bangkok";
export type Location = { slug: LocationSlug; name: string; city: string; status: "pre-launch" | "coming-soon"; strapline: string };

export const locations: Location[] = [
  { slug: "saigon", name: "SPILL Saigon", city: "Saigon", status: "pre-launch", strapline: "Eat. Drink. Meet. Create." },
  { slug: "tokyo", name: "SPILL Tokyo", city: "Tokyo", status: "coming-soon", strapline: "A new SPILL is taking shape." },
  { slug: "hanoi", name: "SPILL Hanoi", city: "Hanoi", status: "coming-soon", strapline: "A new SPILL is taking shape." },
  { slug: "bangkok", name: "SPILL Bangkok", city: "Bangkok", status: "coming-soon", strapline: "A new SPILL is taking shape." },
];

export const globalNavigation = [
  { label: "What’s On", href: "/whats-on" }, { label: "Create", href: "/create" },
  { label: "Partner", href: "/partner" }, { label: "About", href: "/about" },
];

export const localNavigation = [
  { label: "Home", path: "" }, { label: "What’s On", path: "whats-on" },
  { label: "Eat + Drink", path: "menu" }, { label: "SPILL 42", path: "spill42" },
  { label: "Create", path: "create" }, { label: "Book", path: "book" }, { label: "Visit", path: "visit" },
];

export function getLocation(slug: string) { return locations.find((location) => location.slug === slug); }

export function locationStatus(location: Location) {
  if (location.status === "pre-launch") return "Launching soon";
  return location.slug === "tokyo" ? "Coming next" : "Future location";
}

export const socialLinks = [
  { label: "Instagram", href: "https://www.instagram.com/spillsaigon/" },
  { label: "TikTok", href: "https://www.tiktok.com/@spillsaigon" },
  { label: "Threads", href: "https://www.threads.com/@spillsaigon" },
  { label: "X", href: "https://x.com/spillsaigon" },
  { label: "Facebook", href: "https://www.facebook.com/profile.php?id=61594129274861" },
  { label: "LinkedIn", href: "https://www.linkedin.com/company/spill-saigon/about/" },
  { label: "YouTube", href: "https://www.youtube.com/@spillsaigon" },
];
