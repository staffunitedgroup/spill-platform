export type LocationSlug = "saigon" | "hanoi" | "tokyo" | "bangkok";
export type Location = {
  slug: LocationSlug;
  name: string;
  city: string;
  status: "pre-launch" | "coming-soon";
  strapline: string;
};

export const locations: Location[] = [
  {
    slug: "saigon",
    name: "SPILL Saigon",
    city: "Saigon",
    status: "pre-launch",
    strapline: "Eat. Drink. Meet. Create.",
  },
  {
    slug: "tokyo",
    name: "SPILL Tokyo",
    city: "Tokyo",
    status: "coming-soon",
    strapline: "A new SPILL is taking shape.",
  },
  {
    slug: "hanoi",
    name: "SPILL Hanoi",
    city: "Hanoi",
    status: "coming-soon",
    strapline: "A new SPILL is taking shape.",
  },
  {
    slug: "bangkok",
    name: "SPILL Bangkok",
    city: "Bangkok",
    status: "coming-soon",
    strapline: "A new SPILL is taking shape.",
  },
];

export const globalNavigation = [
  {
    label: "What’s On",
    href: "/whats-on",
    items: [
      { label: "Events", href: "/whats-on#events" },
      { label: "SPILL 42", href: "/spill/table/TEST01" },
      { label: "Live", href: "/livestream" },
      { label: "This Week", href: "/whats-on#this-week" },
      { label: "Upcoming", href: "/whats-on#upcoming" },
      { label: "Highlights", href: "/whats-on#highlights" },
    ],
  },
  {
    label: "Create",
    href: "/create",
    items: [
      { label: "Podcast", href: "/podcast" },
      { label: "Livestream", href: "/livestream" },
      { label: "Confessional", href: "/confessional" },
      { label: "Perform", href: "/create#perform" },
      { label: "Host an Event", href: "/saigon/private-events" },
      { label: "Creator Opportunities", href: "/create#creator-opportunities" },
    ],
  },
  {
    label: "Partner",
    href: "/partner",
    items: [
      { label: "Brand Partnerships", href: "/partner#brand-partnerships" },
      { label: "Sponsorship", href: "/partner#sponsorship" },
      {
        label: "Events + Activations",
        href: "/partner#events-and-activations",
      },
      { label: "Content Partnerships", href: "/partner#content-partnerships" },
      { label: "Corporate Events", href: "/saigon/private-events" },
      { label: "Venue Hire", href: "/saigon/private-events" },
    ],
  },
  {
    label: "About",
    href: "/about",
    items: [
      { label: "Our Story", href: "/about#our-story" },
      { label: "The Concept", href: "/about#the-concept" },
      { label: "Community", href: "/about#community" },
      { label: "Locations", href: "/#locations" },
      { label: "Careers", href: "/careers" },
      { label: "Contact", href: "/contact" },
    ],
  },
];

export const localCreateNavigation = [
  { label: "Podcast", href: "/podcast" },
  { label: "Livestream", href: "/livestream" },
  { label: "Confessional", href: "/confessional" },
  { label: "Perform", href: "/saigon/create#perform" },
  { label: "Host an Event", href: "/saigon/private-events" },
  {
    label: "Creator Opportunities",
    href: "/saigon/create#creator-opportunities",
  },
];

export const corporateNavigation = [
  { label: "Invest", href: "/partner/investors" },
  { label: "Franchise", href: "/partner/bring-spill-to-your-city" },
];

export const localNavigation = [
  { label: "Home", path: "" },
  { label: "What’s On", path: "whats-on" },
  { label: "Eat + Drink", path: "menu" },
  { label: "SPILL 42", path: "spill-42" },
  { label: "Create", path: "create" },
  { label: "Book", path: "book" },
  { label: "Visit", path: "visit" },
];

export function getLocation(slug: string) {
  return locations.find((location) => location.slug === slug);
}

export function locationStatus(location: Location) {
  if (location.status === "pre-launch") return "Launching soon";
  return location.slug === "tokyo" ? "Coming next" : "Future location";
}

export const socialLinks = [
  { label: "Instagram", href: "https://www.instagram.com/spillsaigon/" },
  { label: "TikTok", href: "https://www.tiktok.com/@spillsaigon" },
  { label: "Threads", href: "https://www.threads.com/@spillsaigon" },
  { label: "X", href: "https://x.com/spillsaigon" },
  {
    label: "Facebook",
    href: "https://www.facebook.com/profile.php?id=61594129274861",
  },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/company/spill-saigon/about/",
  },
  { label: "YouTube", href: "https://www.youtube.com/@spillsaigon" },
];
