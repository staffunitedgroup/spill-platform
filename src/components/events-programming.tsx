"use client";

import { useState } from "react";
import Link from "next/link";
import { BrandedText, SpillWordmark } from "@/components/brand-text";
import { NavArrow } from "@/components/nav-arrow";

const events = [
  { city: "Saigon", type: "Community", title: "Founder Night", note: "Programming preview" },
  { city: "Tokyo", type: "Opening", title: "Opening Event", note: "Coming next" },
  { city: "Saigon", type: "On air", title: "Livestream Sessions", note: "Programming preview" },
  { city: "Saigon", type: "Podcast", title: "Audience Recording", note: "Programming preview" },
];

export function EventsProgramming() {
  const [filter, setFilter] = useState("All");
  const visible = filter === "All" ? events : events.filter((event) => event.city === filter);
  return <section className="masterSection eventsSection" id="events">
    <div className="eventsHeading" data-reveal><div><div className="sectionNumber">11 / Events & Programming</div><h2>What’s happening<br />at <em><SpillWordmark tone="dark" /></em>?</h2></div><div className="eventFilters" aria-label="Filter events by location">{["All", "Saigon", "Tokyo"].map((city) => <button className={filter === city ? "active" : ""} key={city} onClick={() => setFilter(city)} aria-pressed={filter === city}>{city === "All" ? "All locations" : city}</button>)}</div></div>
    <div className="eventList" aria-live="polite">{visible.map((event, index) => <article key={`${event.city}-${event.title}`}><span>0{index + 1}</span><div><small>{event.city} / {event.type}</small><h3><BrandedText text={event.title} tone="dark" /></h3></div><p>{event.note}</p><b><NavArrow /></b></article>)}</div>
    <Link className="textLink" href="/whats-on">View all events <span>→</span></Link>
  </section>;
}
