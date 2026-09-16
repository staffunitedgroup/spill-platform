import type { Metadata } from "next";
import { Spill42App } from "@/components/spill-42-app";

export const metadata: Metadata = {
  title: "SPILL 42 — Real Conversation. Real Connection.",
  description: "A face-to-face social experience that uses technology to make it easier for people to start talking and discover where a real conversation can lead.",
};

export default function Spill42Page() {
  return <Spill42App />;
}
