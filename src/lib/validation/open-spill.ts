import { z } from "zod";

const token = z.string().trim().min(10, "token is required").max(100);

export const openSchema = z.object({
  tableCode: z.string().trim().min(1, "tableCode is required").max(20),
  displayName: z
    .string()
    .trim()
    .min(1, "Please enter your name")
    .max(40, "That name is too long"),
  ageConfirmed: z.literal(true, {
    error: "Please confirm you are 18 or older",
  }),
  previousToken: token.optional(),
});

export const tokenSchema = z.object({ token });

export const createInviteSchema = z.object({
  token,
  toId: z.string().trim().min(1, "toId is required").max(50),
});

export const respondInviteSchema = z.object({
  token,
  accept: z.boolean(),
});
