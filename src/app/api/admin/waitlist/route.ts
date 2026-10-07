import { NextRequest, NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin-auth";
import { csvResponse } from "@/lib/csv";
import { prisma } from "@/lib/prisma";

// GET /api/admin/waitlist[?location=saigon][&format=csv]
export async function GET(req: NextRequest) {
  if (!isAdmin(req)) {
    return NextResponse.json(
      { error: { code: "UNAUTHORIZED", message: "Invalid admin password." } },
      { status: 401 },
    );
  }

  const location = req.nextUrl.searchParams.get("location") || undefined;
  const signups = await prisma.waitlistSignup.findMany({
    where: location ? { locationSlug: location } : undefined,
    // Latest activity first, so someone signing up again shows at the top.
    orderBy: { updatedAt: "desc" },
  });

  if (req.nextUrl.searchParams.get("format") === "csv") {
    return csvResponse(
      `spill-waitlist${location ? `-${location}` : ""}.csv`,
      ["Signed up", "Last updated", "Location", "Name", "Email", "WhatsApp", "Interests", "Source"],
      signups.map((s) => [
        s.createdAt.toISOString(),
        s.updatedAt.toISOString(),
        s.locationSlug,
        s.name,
        s.email,
        s.whatsapp,
        s.interests.join("; "),
        s.source,
      ]),
    );
  }

  return NextResponse.json({ signups, total: signups.length });
}
