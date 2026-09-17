import { z } from "zod";

export const createSessionSchema = z.object({
  tableCode: z
    .string()
    .trim()
    .min(1, "tableCode is required")
    .max(50, "tableCode is too long"),
});

export type CreateSessionInput = z.infer<typeof createSessionSchema>;
