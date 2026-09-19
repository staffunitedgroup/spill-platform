export type InquiryPayload = {
  subject: string;
  fields: Record<string, string>;
  website?: string;
};

export async function submitInquiry(payload: InquiryPayload) {
  const response = await fetch("/api/inquiries", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const result = await response.json().catch(() => ({ error: "Unable to send your enquiry." }));
  if (!response.ok) throw new Error(result.error || "Unable to send your enquiry.");
  return result as { ok: true };
}
