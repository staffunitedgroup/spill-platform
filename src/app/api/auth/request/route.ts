import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requestLinkSchema } from "@/lib/validation/stay-connected";
import { apiError, readJson } from "@/lib/open-spill";
import {
  LOGIN_LINK_MINUTES,
  authConfigured,
  hashLoginToken,
  maskEmail,
  newLoginToken,
} from "@/lib/guest-auth";
import {
  emailConfigured,
  emailHtml,
  sendEmail,
  siteOrigin,
} from "@/lib/spill-email";

const MAX_LINKS_PER_15_MIN = 3;

// POST /api/auth/request  { email, participantToken? }
// Emails a one-time sign-in link. From the result screen it carries the
// player, so signing in also saves the Stay Connected.
export async function POST(req: NextRequest) {
  if (!authConfigured()) {
    return apiError("AUTH_NOT_CONFIGURED", "Sign-in isn't set up yet.", 503);
  }
  const parsed = requestLinkSchema.safeParse(await readJson(req));
  if (!parsed.success) {
    return apiError(
      "VALIDATION_ERROR",
      parsed.error.issues[0]?.message ?? "Invalid input.",
      400,
    );
  }
  const { email, participantToken } = parsed.data;

  let participantId: string | null = null;
  if (participantToken) {
    const player = await prisma.participant.findUnique({
      where: { participantToken },
      select: { id: true, wantsStayConnected: true, sessionId: true },
    });
    // Stay Connected is only offered after BOTH chose it.
    const players = player
      ? await prisma.participant.findMany({
          where: { sessionId: player.sessionId },
          select: { wantsStayConnected: true },
        })
      : [];
    const mutual =
      players.length === 2 &&
      players.every((p) => p.wantsStayConnected === true);
    if (!player || !mutual) {
      return apiError(
        "NOT_MUTUAL",
        "Stay Connected needs both of you to choose it.",
        409,
      );
    }
    participantId = player.id;
  }

  const recent = await prisma.loginToken.count({
    where: { email, createdAt: { gte: new Date(Date.now() - 15 * 60_000) } },
  });
  if (recent >= MAX_LINKS_PER_15_MIN) {
    return apiError(
      "TOO_MANY",
      "We just sent you a link — check your inbox (and spam).",
      429,
    );
  }

  const token = newLoginToken();
  await prisma.loginToken.create({
    data: {
      email,
      tokenHash: hashLoginToken(token),
      participantId,
      expiresAt: new Date(Date.now() + LOGIN_LINK_MINUTES * 60_000),
    },
  });

  const link = `${siteOrigin(req)}/spill/auth?token=${token}`;

  if (!emailConfigured()) {
    if (process.env.NODE_ENV === "production") {
      return apiError(
        "EMAIL_NOT_CONFIGURED",
        "Email isn't set up yet. Please ask staff.",
        503,
      );
    }
    // Local testing without Resend: hand the link back instead of emailing it.
    console.info(`[auth] sign-in link for ${email}: ${link}`);
    return NextResponse.json({
      ok: true,
      sentTo: maskEmail(email),
      devLink: link,
    });
  }

  const sent = await sendEmail({
    to: email,
    subject: "Your SPILL sign-in link",
    text: `Tap to sign in to SPILL and stay connected:\n${link}\n\nThe link works for ${LOGIN_LINK_MINUTES} minutes. If you didn't ask for it, ignore this email.`,
    html: emailHtml({
      heading: "Stay connected",
      body: `Tap the button to sign in. We'll let you know when your SPILL match is back — no chat, no profiles, just a nudge to meet again in person.`,
      cta: { label: "Sign in to SPILL", href: link },
      footer: `The link works for ${LOGIN_LINK_MINUTES} minutes. If you didn't ask for it, you can ignore this email.`,
    }),
  });
  if (!sent) {
    return apiError(
      "EMAIL_FAILED",
      "We couldn't send the email. Try again in a minute.",
      502,
    );
  }
  return NextResponse.json({ ok: true, sentTo: maskEmail(email) });
}
