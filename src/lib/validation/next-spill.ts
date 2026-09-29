import { z } from "zod";

export const nextSpillSchema = z.object({
  participantToken: z.string().min(1, "participantToken is required"),
  // Sequence the client is currently looking at (0 = no card yet).
  // Makes the call idempotent: two phones tapping Next at once can't skip a card.
  currentSequence: z.number().int().min(0).optional(),
  // true = the spotlight player passes on the current card (uses one pass).
  passed: z.boolean().optional(),
});

export type NextSpillInput = z.infer<typeof nextSpillSchema>;
