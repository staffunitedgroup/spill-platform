import { z } from "zod";

export const endingSchema = z.object({
  participantToken: z.string().min(1, "participantToken is required"),
  wantsStayConnected: z.boolean(),
});

export type EndingInput = z.infer<typeof endingSchema>;
