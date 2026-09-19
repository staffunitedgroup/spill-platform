import { z } from "zod";

export const runtime = "nodejs";

const inquirySchema = z.object({
  subject: z.string().trim().min(3).max(120),
  fields: z.record(z.string().max(60), z.string().trim().max(4000)).refine((fields) => Object.keys(fields).length <= 30),
  website: z.string().max(200).optional(),
});

const attempts = new Map<string, number[]>();

function rateLimited(ip: string) {
  const now = Date.now();
  const recent = (attempts.get(ip) ?? []).filter((time) => now - time < 10 * 60 * 1000);
  recent.push(now);
  attempts.set(ip, recent);
  return recent.length > 5;
}

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (rateLimited(ip)) return Response.json({ error: "Too many enquiries. Please try again shortly." }, { status: 429 });

  const parsed = inquirySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Please check the form and try again." }, { status: 400 });
  if (parsed.data.website) return Response.json({ ok: true });

  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.INQUIRY_FROM_EMAIL;
  if (!apiKey || !from) return Response.json({ error: "Email delivery is not configured yet. Please contact hello@spillcafebar.com." }, { status: 503 });

  const replyTo = parsed.data.fields.Email;
  const subject = parsed.data.subject.replace(/[\r\n]+/g, " ");
  const text = Object.entries(parsed.data.fields).filter(([, value]) => value).map(([label, value]) => `${label}:\n${value}`).join("\n\n");
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      from,
      to: ["hello@spillcafebar.com"],
      subject,
      text,
      ...(replyTo ? { reply_to: replyTo } : {}),
      tags: [{ name: "source", value: "spill-website" }],
    }),
  });

  if (!response.ok) return Response.json({ error: "Your enquiry could not be sent. Please try again or email hello@spillcafebar.com." }, { status: 502 });
  return Response.json({ ok: true });
}
