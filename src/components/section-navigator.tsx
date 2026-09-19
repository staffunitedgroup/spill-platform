"use client";

import { useEffect, useState } from "react";

export function SectionNavigator() {
  const [progress, setProgress] = useState(0);
  const [atBottom, setAtBottom] = useState(false);
  const [available, setAvailable] = useState(false);

  useEffect(() => {
    const sections = Array.from(document.querySelectorAll<HTMLElement>("main > section"));
    const update = () => {
      const maximum = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(maximum > 0 ? Math.min(100, (window.scrollY / maximum) * 100) : 0);
      setAtBottom(window.scrollY >= maximum - 80);
    };
    const initialFrame = window.requestAnimationFrame(() => {
      setAvailable(sections.length > 1);
      update();
    });
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => { window.cancelAnimationFrame(initialFrame); window.removeEventListener("scroll", update); window.removeEventListener("resize", update); };
  }, []);

  function move() {
    if (atBottom) return window.scrollTo({ top: 0, behavior: "smooth" });
    const sections = Array.from(document.querySelectorAll<HTMLElement>("main > section"));
    const next = sections.find((section) => section.getBoundingClientRect().top > 80);
    (next ?? sections[sections.length - 1])?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  if (!available) return null;
  return <><div className="scrollProgress" aria-hidden="true"><span style={{ width: `${progress}%` }} /></div><button className="sectionNavigator" type="button" onClick={move} aria-label={atBottom ? "Back to the top" : "Continue to the next section"}><span>{atBottom ? "Back to top" : "Next section"}</span><b aria-hidden="true">{atBottom ? "↑" : "↓"}</b></button></>;
}
