"use client";

import { useEffect } from "react";

/**
 * Loads the current address again as a full page. Used by the SPILL 42 gate:
 * when a guest clicks into the game from inside the site, the full load lets
 * the root layout show the proper full-screen access screen (instead of a lock
 * box drawn inside the page they came from). A plain dark cover hides the
 * moment in between.
 */
export function FullReload() {
  useEffect(() => {
    window.location.replace(window.location.href);
  }, []);
  return <div aria-hidden="true" style={{ position: "fixed", inset: 0, zIndex: 9999, background: "#090909" }} />;
}
