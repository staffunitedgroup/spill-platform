import type { PortalSection } from "@/components/portal-page";

export const globalPageContent: Record<string, { eyebrow: string; title: string; description: string; note?: string; filters?: Array<{ label: string; name: string; options: string[] }>; sections: PortalSection[] }> = {
  "whats-on": {
    eyebrow: "Across the SPILL network", title: "What’s on",
    description: "Discover what is happening across every SPILL location. Filter by location, date, event type, and free or ticketed experiences as the network grows.",
    filters: [
      { label: "Location", name: "location", options: ["All locations", "Saigon", "Hanoi", "Tokyo"] },
      { label: "Date", name: "date", options: ["Any date", "Tonight", "This week", "Upcoming"] },
      { label: "Event type", name: "type", options: ["All events", "SPILL 42", "Live", "Performance", "Workshop"] },
      { label: "Entry", name: "entry", options: ["Free / Ticketed", "Free", "Ticketed"] },
    ],
    note: "One network. Many rooms. Always something worth showing up for.",
    sections: [
      { title: "Events", text: "Talks, performances, launches, meetups, workshops, and nights shaped by the people in the room.", detail: "Filter · Location · Date · Event type" },
      { title: "SPILL 42", text: "The signature social experience that turns a room full of people into a room full of conversation." },
      { title: "Live", text: "Broadcasts, performances, interviews, and moments happening live from SPILL locations." },
      { title: "This Week", text: "A fast view of the experiences happening across the network in the next seven days.", detail: "Filter · Free / ticketed" },
      { title: "Upcoming", text: "Plan ahead for the next conversation, creator event, cultural moment, or night out." },
      { title: "Highlights", text: "Watch the moments, stories, and people that made the room feel different." },
    ],
  },
  create: {
    eyebrow: "The creator ecosystem", title: "Create at SPILL",
    description: "A global home for creators, formats, and ideas—connecting a real room, professional production, and an audience that can travel far beyond it.",
    note: "Future formats can grow here: SPILL Sessions, interviews, music, comedy, photography, short-form video, workshops, and more.",
    sections: [
      { title: "Podcast", text: "Professional podcast creation and production in a space built for real conversation.", href: "/podcast" },
      { title: "Livestream", text: "Live digital broadcasting, audience participation, and social distribution.", href: "/livestream" },
      { title: "Confessional", text: "A private, low-pressure format for honest short-form storytelling.", href: "/confessional" },
      { title: "Perform", text: "A stage for musicians, comedians, speakers, artists, and emerging creators." },
      { title: "Host an Event", text: "Bring a meetup, launch, panel, workshop, private event, or community gathering to SPILL." },
      { title: "Creator Opportunities", text: "Collaborations, editorial invitations, sponsor-funded opportunities, and participation in SPILL content." },
    ],
  },
  partner: {
    eyebrow: "For brands and organizations", title: "Partner with SPILL",
    description: "Connect a physical venue, a real audience, live events, creators, original content, and social distribution through one partnership platform.",
    note: "Physical venue + audience + events + creators + content + social distribution.",
    sections: [
      { title: "Brand Partnerships", text: "Build a meaningful presence inside SPILL culture through collaborations made for participation." },
      { title: "Sponsorship", text: "Support signature formats, event series, and creator-led programming with measurable reach." },
      { title: "Events + Activations", text: "Turn launches and activations into experiences people want to attend and share." },
      { title: "Content Partnerships", text: "Create original stories with SPILL talent, production formats, and distribution." },
      { title: "Corporate Events", text: "Host teams, clients, panels, celebrations, and private conversations in a flexible social venue." },
      { title: "Venue Hire", text: "Hire the room, production capability, hospitality, or the complete ecosystem.", href: "/saigon/private-events" },
    ],
  },
  about: {
    eyebrow: "More than a café bar", title: "About SPILL",
    description: "SPILL exists to create better reasons for people to meet—and give great conversations somewhere to go next.",
    note: "A hospitality concept, a creative platform, and a growing cultural network.",
    sections: [
      { title: "Our Story", text: "Built from a simple belief: good people and brighter conversations can change what a venue becomes." },
      { title: "The Concept", text: "Coffee and drinks meet events, entertainment, creators, and media in one connected experience." },
      { title: "Community", text: "Regulars, visitors, founders, artists, professionals, and curious people all shape the room." },
      { title: "Locations", text: "One global idea, expressed with a distinct local personality in every city.", href: "/#locations" },
      { title: "Careers", text: "Help build the places, experiences, and stories that make SPILL feel alive.", href: "/careers" },
      { title: "Contact", text: "Talk to the team about a visit, collaboration, story, or opportunity.", href: "/contact" },
    ],
  },
};

export const localPageContent: Record<string, { title: string; description: string; note?: string; sections: PortalSection[] }> = {
  "whats-on": { title: "What’s on", description: "The local entertainment and events calendar. Start with the question: what’s happening at SPILL tonight?", sections: [
    { title: "Tonight", text: "The fastest way to see what is happening in the room right now." }, { title: "This Week", text: "Seven days of conversations, performances, broadcasts, and social experiences." }, { title: "Events", text: "Panels, launches, community gatherings, workshops, music, comedy, and more." }, { title: "SPILL 42", text: "Upcoming editions of the signature SPILL social experience." }, { title: "Live", text: "Watch live broadcasts and performances from SPILL Saigon." }, { title: "Upcoming", text: "Plan the next reason to come back." },
  ] },
  spill42: { title: "SPILL 42", description: "Forty-two prompts. Four ways to connect. One signature experience designed to help people put the phones down and meet in the real world.", sections: [
    { title: "About", text: "A guided social format that makes it easier to move beyond small talk." }, { title: "How It Works", text: "Choose a prompt, follow the room, join at your own pace, and see where the conversation goes." }, { title: "Upcoming", text: "Find the next SPILL 42 session in Saigon." }, { title: "Participate", text: "Come alone or bring people. Participation is always yours to choose." }, { title: "Watch", text: "See selected moments and stories created through SPILL 42." }, { title: "Sponsor", text: "Support a format built around real participation, culture, and community." },
  ] },
  create: { title: "Create at SPILL", description: "Record, broadcast, perform, host, collaborate, and share your story from SPILL Saigon.", sections: [
    { title: "Podcast", text: "Professional podcast creation and production.", href: "/podcast" }, { title: "Livestream", text: "Live digital broadcasting and social distribution.", href: "/livestream" }, { title: "Confessional", text: "Short-form storytelling and content creation.", href: "/confessional" }, { title: "Perform", text: "For musicians, comedians, speakers, artists, and creators.", href: "/saigon/create#perform" }, { title: "Host an Event", text: "For meetups, launches, panels, workshops, private events, and community gatherings.", href: "/saigon/private-events" }, { title: "Creator Opportunities", text: "Collaborations, editorial invitations, sponsor-funded opportunities, and SPILL content.", href: "/saigon/create#creator-opportunities" },
  ] },
  book: { title: "Book SPILL", description: "One central place to reserve a table, production format, event, venue, or business experience.", note: "Choose what you want to make happen. We’ll help shape the rest.", sections: [
    { title: "Table", text: "Reserve your place for coffee, drinks, food, and conversation." }, { title: "Podcast", text: "Book a professional recording session." }, { title: "Livestream", text: "Plan a live broadcast with production support." }, { title: "Confessional", text: "Record a short-form story in the SPILL Confessional." }, { title: "Event", text: "Bring a meetup, workshop, launch, panel, or private event." }, { title: "Venue", text: "Explore full or partial venue hire.", href: "/saigon/private-events" }, { title: "Brand / Corporate", text: "Create a partnership, activation, or tailored company experience.", href: "/partner" },
  ] },
  visit: { title: "Visit", description: "Everything you need before you arrive at SPILL Saigon.", note: "Parking and transport, accessibility, and house information will be published ahead of opening.", sections: [
    { title: "Location", text: "SPILL Saigon’s full address will be announced ahead of launch." }, { title: "Hours", text: "Opening hours and live venue status will be kept current here." }, { title: "Directions", text: "Simple directions, nearby landmarks, parking, and transport information." }, { title: "Contact", text: "Email hello@spillcafebar.com or connect with @spillsaigon." }, { title: "FAQ", text: "Answers covering access, reservations, events, age guidance, and the house experience." },
  ] },
};
