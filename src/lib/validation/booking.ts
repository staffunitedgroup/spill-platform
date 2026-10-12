import { z } from "zod";
import { REQUEST_KINDS } from "@/lib/booking-meta";

export const bookingRequestSchema = z.object({
  kind: z.enum(REQUEST_KINDS),
  name: z.string().trim().min(1, "Please add your name").max(120),
  email: z.string().trim().toLowerCase().email("Please enter a valid email").max(200),
  whatsapp: z
    .string()
    .trim()
    .max(40)
    .regex(/^[+\d\s().-]*$/, "Please enter a valid WhatsApp number")
    .optional()
    .or(z.literal("")),
  whatsappCountry: z.string().trim().regex(/^[A-Z]{2}$/).optional().or(z.literal("")),
  /** One line for the team's list. */
  summary: z.string().trim().max(200).optional().default(""),
  /** The rest of the form, in order. Empty answers are dropped. */
  fields: z
    .array(z.object({ label: z.string().trim().min(1).max(80), value: z.string().trim().max(4000) }))
    .max(30)
    .default([]),
  /** Honeypot: real people never fill this in. */
  website: z.string().max(200).optional(),
});

export type BookingRequestInput = z.input<typeof bookingRequestSchema>;

export const bookingUpdateSchema = z.object({
  status: z.enum(["NEW", "CONTACTED", "CONFIRMED", "CLOSED"]).optional(),
  notes: z.string().max(4000).optional(),
});
