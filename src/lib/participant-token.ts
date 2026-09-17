import { randomBytes } from "crypto";

export function generateParticipantToken(): string {
  return randomBytes(24).toString("base64url");
}
