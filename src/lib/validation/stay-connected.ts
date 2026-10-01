import { z } from "zod";

export const requestLinkSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Please enter a valid email")
    .max(200),
  /** The player asking from the result screen (links on sign-in). */
  participantToken: z.string().trim().min(10).max(100).optional(),
});

export const verifyLinkSchema = z.object({
  token: z.string().trim().min(20).max(200),
});

export const linkPlayerSchema = z.object({
  participantToken: z.string().trim().min(10).max(100),
});

export const settingsSchema = z
  .object({
    emailNotifications: z.boolean().optional(),
    notificationsPaused: z.boolean().optional(),
  })
  .refine(
    (v) =>
      v.emailNotifications !== undefined || v.notificationsPaused !== undefined,
    {
      message: "Nothing to change",
    },
  );

export const connectionUpdateSchema = z
  .object({
    notify: z.boolean().optional(),
    remove: z.literal(true).optional(),
  })
  .refine((v) => v.notify !== undefined || v.remove, {
    message: "Nothing to change",
  });
