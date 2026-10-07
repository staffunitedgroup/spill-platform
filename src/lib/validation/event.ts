import { z } from "zod";
import { EVENT_CATEGORIES, youtubeId } from "@/lib/event-meta";
import { locations } from "@/lib/site-data";
import { waitlistSchema } from "@/lib/validation/waitlist";

const locationSlugs = locations.map((l) => l.slug) as [string, ...string[]];
const optionalText = (max: number) => z.string().trim().max(max).optional().or(z.literal(""));
const localDateTime = z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/, "Please pick a date and time");

/** What the admin form sends. Times are venue-local "YYYY-MM-DDTHH:mm". */
export const eventInputSchema = z.object({
  locationSlug: z.enum(locationSlugs),
  title: z.string().trim().min(3, "Title is too short").max(120),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Link can only use a–z, 0–9 and dashes")
    .max(80)
    .optional()
    .or(z.literal("")),
  summary: z.string().trim().min(1, "Add a short summary").max(240),
  description: optionalText(5000),
  category: z.enum(EVENT_CATEGORIES),
  startsAt: localDateTime,
  endsAt: localDateTime.optional().or(z.literal("")),
  imageUrl: z
    .string()
    .trim()
    .max(500)
    .refine((v) => v.startsWith("/") || /^https:\/\//.test(v), "Image must be a /assets/… path or an https:// link")
    .refine((v) => !youtubeId(v), "That's a YouTube link — paste it in the YouTube field instead")
    .optional()
    .or(z.literal("")),
  ticketUrl: z.string().trim().max(500).url().startsWith("https://", "Ticket link must start with https://").optional().or(z.literal("")),
  youtubeUrl: z
    .string()
    .trim()
    .max(500)
    .refine((v) => Boolean(youtubeId(v)), "That doesn't look like a YouTube link")
    .optional()
    .or(z.literal("")),
  rsvpEnabled: z.boolean().default(true),
  featured: z.boolean().default(false),
  published: z.boolean().default(false),
});

export type EventInput = z.infer<typeof eventInputSchema>;

/** "I'm coming" on an event page — the same fields as the waitlist, plus party size. */
export const rsvpSchema = waitlistSchema
  .pick({ email: true, whatsapp: true, whatsappCountry: true, website: true })
  .extend({
    name: z.string().trim().min(1, "Please add your name").max(120),
    partySize: z.coerce.number().int().min(1, "At least 1 person").max(10, "Up to 10 people per sign-up — for bigger groups, contact us").default(1),
  });
