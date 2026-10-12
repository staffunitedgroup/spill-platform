import { NextRequest, NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin-auth";
import { KIND_META, REQUEST_KINDS, REQUEST_STATUSES, STATUS_LABEL, type RequestField } from "@/lib/booking-meta";
import { csvResponse } from "@/lib/csv";
import { unauthorized } from "@/lib/event-admin";
import { prisma } from "@/lib/prisma";

// GET /api/admin/requests[?kind=PODCAST][&status=NEW][&format=csv]
export async function GET(req: NextRequest) {
  if (!isAdmin(req)) return unauthorized();
  const kind = req.nextUrl.searchParams.get("kind");
  const status = req.nextUrl.searchParams.get("status");

  const requests = await prisma.bookingRequest.findMany({
    where: {
      ...(kind && (REQUEST_KINDS as readonly string[]).includes(kind) ? { kind: kind as (typeof REQUEST_KINDS)[number] } : {}),
      ...(status && (REQUEST_STATUSES as readonly string[]).includes(status) ? { status: status as (typeof REQUEST_STATUSES)[number] } : {}),
    },
    orderBy: { createdAt: "desc" },
  });

  if (req.nextUrl.searchParams.get("format") === "csv") {
    return csvResponse(
      "spill-requests.csv",
      ["Received", "Type", "Status", "Name", "Email", "WhatsApp", "Summary", "Details", "Team notes"],
      requests.map((r) => [
        r.createdAt.toISOString(),
        KIND_META[r.kind].label,
        STATUS_LABEL[r.status],
        r.name,
        r.email,
        r.whatsapp,
        r.summary,
        (r.fields as RequestField[]).map((f) => `${f.label}: ${f.value}`).join("\n"),
        r.notes,
      ]),
    );
  }

  const counts = await prisma.bookingRequest.groupBy({ by: ["status"], _count: true });
  return NextResponse.json({
    requests,
    newCount: counts.find((c) => c.status === "NEW")?._count ?? 0,
  });
}
