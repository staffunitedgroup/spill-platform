import { prisma } from "@/lib/prisma";

/**
 * Add someone to a location's waitlist, or refresh their details if they're
 * already on it. Interests are merged, never removed.
 * Used by the waitlist form and by event RSVPs.
 */
export async function addToWaitlist(input: {
  email: string;
  locationSlug: string;
  name?: string | null;
  whatsapp?: string | null;
  interests?: string[];
  source?: string | null;
}) {
  const { email, locationSlug } = input;
  const interests = input.interests ?? [];
  const existing = await prisma.waitlistSignup.findUnique({
    where: { email_locationSlug: { email, locationSlug } },
    select: { interests: true },
  });
  await prisma.waitlistSignup.upsert({
    where: { email_locationSlug: { email, locationSlug } },
    create: {
      email,
      locationSlug,
      name: input.name || null,
      whatsapp: input.whatsapp || null,
      interests,
      source: input.source ?? null,
    },
    update: {
      ...(input.name ? { name: input.name } : {}),
      ...(input.whatsapp ? { whatsapp: input.whatsapp } : {}),
      interests: Array.from(new Set([...(existing?.interests ?? []), ...interests])),
    },
  });
}
