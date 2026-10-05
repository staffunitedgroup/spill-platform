import { z } from "zod";
import { locations } from "@/lib/site-data";

/** What people can ask to hear about. Kept short so the form stays one tap each. */
export const WAITLIST_INTERESTS = [
  "Opening news",
  "Events",
  "SPILL 42",
  "Podcast + Livestream",
  "Private events",
] as const;

const locationSlugs = locations.map((location) => location.slug) as [
  string,
  ...string[],
];

export const waitlistSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Please enter a valid email")
    .max(200),
  name: z.string().trim().max(120).optional().or(z.literal("")),
  whatsapp: z
    .string()
    .trim()
    .max(40)
    .regex(/^[+\d\s().-]*$/, "Please enter a valid WhatsApp number")
    .optional()
    .or(z.literal("")),
  locationSlug: z.enum(locationSlugs),
  interests: z.array(z.enum(WAITLIST_INTERESTS)).max(WAITLIST_INTERESTS.length).default([]),
  source: z.string().trim().max(60).optional(),
  /** Honeypot: real people never fill this in. */
  website: z.string().max(200).optional(),
});

export type WaitlistInput = z.input<typeof waitlistSchema>;
