import type { ReactNode } from "react";
import { GameGate } from "@/lib/game-gate";

// Every SPILL 42 game page (/spill/…) is team-only (or open to all on launch day).
export default function SpillGameLayout({ children }: { children: ReactNode }) {
  return <GameGate>{children}</GameGate>;
}
