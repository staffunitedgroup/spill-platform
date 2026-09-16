export type LocationSlug = "saigon" | "hanoi" | "tokyo";
export type Location = { slug: LocationSlug; name: string; city: string; status: "open" | "coming-soon"; strapline: string };

export const locations: Location[] = [
  { slug: "saigon", name: "SPILL Saigon", city: "Saigon", status: "open", strapline: "Eat. Drink. Meet. Create." },
  { slug: "hanoi", name: "SPILL Hanoi", city: "Hanoi", status: "coming-soon", strapline: "A new SPILL is taking shape." },
  { slug: "tokyo", name: "SPILL Tokyo", city: "Tokyo", status: "coming-soon", strapline: "A new SPILL is taking shape." },
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
