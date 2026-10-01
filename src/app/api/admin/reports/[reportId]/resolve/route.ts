import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/admin-auth";
import { apiError } from "@/lib/open-spill";

// POST /api/admin/reports/:reportId/resolve — staff have dealt with it.
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ reportId: string }> },
) {
  if (!isAdmin(req)) {
    return apiError("UNAUTHORIZED", "Invalid admin password.", 401);
  }
  const { reportId } = await params;

  await prisma.spillReport.updateMany({
    where: { id: reportId, status: "OPEN" },
    data: { status: "RESOLVED", resolvedAt: new Date() },
  });

  return NextResponse.json({ ok: true });
}
