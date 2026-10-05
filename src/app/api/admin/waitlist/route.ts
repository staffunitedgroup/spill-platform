import { NextRequest, NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

function csvCell(value: string | null | undefined) {
  const text = value ?? "";
  // Quote everything; neutralise spreadsheet formulas (=, @, or +/- not followed
  // by a plain phone number like "+84 90 123 4567").
  const isFormula = /^[=@\t\r]/.test(text) || (/^[+-]/.test(text) && !/^[+-][\d\s().-]*$/.test(text));
  const safe = isFormula ? `'${text}` : text;
  return `"${safe.replaceAll('"', '""')}"`;
}

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
    orderBy: { createdAt: "desc" },
  });

  if (req.nextUrl.searchParams.get("format") === "csv") {
    const header = ["Signed up", "Location", "Name", "Email", "WhatsApp", "Interests", "Source"];
    const rows = signups.map((s) =>
      [
        s.createdAt.toISOString(),
        s.locationSlug,
        s.name,
        s.email,
        s.whatsapp,
        s.interests.join("; "),
        s.source,
      ].map(csvCell).join(","),
    );
    const csv = "﻿" + [header.map(csvCell).join(","), ...rows].join("\r\n");
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="spill-waitlist${location ? `-${location}` : ""}.csv"`,
        "Cache-Control": "no-store",
      },
    });
  }

  return NextResponse.json({ signups, total: signups.length });
}
