import type { RequestField, RequestKindKey } from "@/lib/booking-meta";

// Website enquiry forms (private events, franchise, investors, quick contact).
// Saved in Admin → Requests; the guest gets a confirmation and the team an email.
export type InquiryPayload = {
  kind: RequestKindKey;
  name: string;
  email: string;
  /** One line for the team's list in Admin. */
  summary?: string;
  fields: RequestField[];
  website?: string;
};

export async function submitInquiry(payload: InquiryPayload) {
  const response = await fetch("/api/requests", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const result = await response.json().catch(() => ({ error: "Unable to send your enquiry." }));
  if (!response.ok) throw new Error(result.error || "Unable to send your enquiry.");
  return result as { ok: true; emailed?: boolean };
}
