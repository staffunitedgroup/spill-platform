import type { ReactNode } from "react";
import { GameGate } from "@/lib/game-gate";

// The SPILL 42 start page is team-only (or open to all on launch day).
export default function Spill42Layout({ children }: { children: ReactNode }) {
  return <GameGate>{children}</GameGate>;
}
