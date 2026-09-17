import { z } from "zod";

export const nextSpillSchema = z.object({
  participantToken: z.string().min(1, "participantToken is required"),
});

export type NextSpillInput = z.infer<typeof nextSpillSchema>;
