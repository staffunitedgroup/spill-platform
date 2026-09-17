import { z } from "zod";

export const joinSessionSchema = z.object({
  displayName: z
    .string()
    .trim()
    .min(1, "displayName is required")
    .max(40, "displayName is too long"),
});

export type JoinSessionInput = z.infer<typeof joinSessionSchema>;
