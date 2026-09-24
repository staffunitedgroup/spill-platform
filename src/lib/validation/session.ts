import { z } from "zod";

export const createSessionSchema = z
  .object({
    tableCode: z
      .string()
      .trim()
      .min(1, "tableCode is required")
      .max(50, "tableCode is too long"),
    mode: z.enum(["TWO_PERSON", "GROUP"]).optional().default("TWO_PERSON"),
    groupSize: z.number().int().min(3).max(6).optional(),
  })
  .refine(
    (data) => data.mode !== "GROUP" || typeof data.groupSize === "number",
    {
      message: "groupSize (3-6) is required when mode is GROUP",
      path: ["groupSize"],
    },
  );

export type CreateSessionInput = z.infer<typeof createSessionSchema>;
