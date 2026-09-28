import { z } from "zod";

export const nextSpillSchema = z.object({
  participantToken: z.string().min(1, "participantToken is required"),
  currentSequence: z.number().int().min(0).optional(),
});

export type NextSpillInput = z.infer<typeof nextSpillSchema>;
