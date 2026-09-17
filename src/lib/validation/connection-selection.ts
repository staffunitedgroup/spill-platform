import { z } from "zod";

export const connectionSelectionSchema = z.object({
  participantToken: z.string().min(1, "participantToken is required"),
  connectionType: z.enum([
    "FRIENDS_ONLY",
    "FRIENDS",
    "MAYBE_MORE",
    "ALREADY_TOGETHER",
  ]),
});

export type ConnectionSelectionInput = z.infer<
  typeof connectionSelectionSchema
>;
