import type { Metadata } from "next";
import { Spill42Start } from "@/components/spill42-start";

export const metadata: Metadata = {
  title: "SPILL 42 — Real Conversation. Real Connection.",
  description:
    "A face-to-face social experience that uses technology to make it easier for people to start talking and discover where a real conversation can lead.",
};

// The way into SPILL 42 from the website: scan the table QR or enter its code.
export default function Spill42Page() {
  return <Spill42Start />;
}
