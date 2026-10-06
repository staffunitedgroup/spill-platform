"use client";

import { useState } from "react";
import Link from "next/link";
import { BrandedText, SpillWordmark } from "@/components/brand-text";
import { NavArrow } from "@/components/nav-arrow";

export type ProgrammingItem = { city: string; type: string; title: string; note: string; href?: string };

// Shown until real events are featured in /admin/events.
const previewEvents: ProgrammingItem[] = [
  { city: "Saigon", type: "Community", title: "Founder Night", note: "Programming preview" },
  { city: "Tokyo", type: "Opening", title: "Opening Event", note: "Coming next" },
  { city: "Saigon", type: "On air", title: "Livestream Sessions", note: "Programming preview" },
  { city: "Saigon", type: "Podcast", title: "Audience Recording", note: "Programming preview" },
];

export function EventsProgramming({ events }: { events?: ProgrammingItem[] }) {
  const items = events?.length ? events : previewEvents;
  const cities = ["All", ...Array.from(new Set(items.map((event) => event.city)))];
  const [filter, setFilter] = useState("All");
  const visible = filter === "All" ? items : items.filter((event) => event.city === filter);
  return <section className="masterSection eventsSection" id="events">
    <div className="eventsHeading" data-reveal><div><div className="sectionNumber">11 / Events & Programming</div><h2>What’s happening<br />at <em><SpillWordmark tone="dark" /></em>?</h2></div><div className="eventFilters" aria-label="Filter events by location">{cities.map((city) => <button className={filter === city ? "active" : ""} key={city} onClick={() => setFilter(city)} aria-pressed={filter === city}>{city === "All" ? "All locations" : city}</button>)}</div></div>
    <div className="eventList" aria-live="polite">{visible.map((event, index) => {
      const row = <><span>{String(index + 1).padStart(2, "0")}</span><div><small>{event.city} / {event.type}</small><h3><BrandedText text={event.title} tone="dark" /></h3></div><p>{event.note}</p><b><NavArrow /></b></>;
      return event.href
        ? <Link className="eventListLink" href={event.href} key={event.href}><article>{row}</article></Link>
        : <article key={`${event.city}-${event.title}`}>{row}</article>;
    })}</div>
    <Link className="textLink" href="/whats-on">View all events <span>→</span></Link>
  </section>;
}
