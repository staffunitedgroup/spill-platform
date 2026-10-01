// Sends SPILL 42 emails through Resend — the same account the website's
// contact form already uses (RESEND_API_KEY).
import "server-only";

function fromAddress(): string | null {
  return (
    process.env.SPILL_FROM_EMAIL?.trim() ||
    process.env.INQUIRY_FROM_EMAIL?.trim() ||
    null
  );
}

export function emailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY?.trim() && fromAddress());
}

export async function sendEmail(input: {
  to: string;
  subject: string;
  text: string;
  html: string;
}): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = fromAddress();
  if (!apiKey || !from) return false;
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from,
        to: [input.to],
        subject: input.subject,
        text: input.text,
        html: input.html,
        tags: [{ name: "source", value: "spill-42" }],
      }),
    });
    if (!res.ok) {
      console.error(
        "[spill-email] Resend refused",
        res.status,
        await res.text().catch(() => ""),
      );
    }
    return res.ok;
  } catch (err) {
    console.error("[spill-email] send failed", err);
    return false;
  }
}

/** Public origin for links in emails: NEXT_PUBLIC_SITE_URL, else the request's. */
export function siteOrigin(req: Request): string {
  const fixed = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/$/, "");
  return fixed || new URL(req.url).origin;
}

const esc = (s: string) =>
  s.replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ]!,
  );

/** Simple dark email in the SPILL palette. */
export function emailHtml(opts: {
  heading: string;
  body: string;
  cta?: { label: string; href: string };
  footer?: string;
}) {
  return `<!doctype html><html><body style="margin:0;background:#111111;font-family:Arial,Helvetica,sans-serif;color:#ffffff">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#111111;padding:32px 16px"><tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px">
<tr><td style="font-size:13px;letter-spacing:4px;color:#E8472F;padding-bottom:18px">SPILL 42</td></tr>
<tr><td style="font-size:26px;line-height:1.2;font-weight:bold;padding-bottom:14px">${esc(opts.heading)}</td></tr>
<tr><td style="font-size:16px;line-height:1.6;color:#C0C4C8;padding-bottom:24px">${esc(opts.body)}</td></tr>
${opts.cta ? `<tr><td style="padding-bottom:28px"><a href="${esc(opts.cta.href)}" style="display:inline-block;background:#E8472F;color:#111111;text-decoration:none;font-weight:bold;letter-spacing:1px;padding:14px 22px">${esc(opts.cta.label)} &rarr;</a></td></tr>` : ""}
${opts.footer ? `<tr><td style="font-size:13px;line-height:1.5;color:#8a8e92">${esc(opts.footer)}</td></tr>` : ""}
</table></td></tr></table></body></html>`;
}
