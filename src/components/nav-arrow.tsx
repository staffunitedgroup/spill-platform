export function NavArrow({ direction = "up" }: { direction?: "up" | "down" }) {
  return <svg className={`navArrow ${direction === "down" ? "down" : ""}`} viewBox="0 0 20 20" aria-hidden="true"><path d="M4 16 16 4M7 4h9v9" /></svg>;
}
