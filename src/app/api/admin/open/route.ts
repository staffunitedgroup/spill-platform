import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/admin-auth";
import { apiError, expireStale } from "@/lib/open-spill";
import { isSessionStale } from "@/lib/session-staleness";

// GET /api/admin/open — staff view for the floor:
//   tables    every table and whether it's free / waiting / playing
//   open      who is "open to SPILL" (or paused) right now
//   reports   reports from the last 24 hours + anything still open
export async function GET(req: NextRequest) {
  if (!isAdmin(req)) {
    return apiError("UNAUTHORIZED", "Invalid admin password.", 401);
  }

  await expireStale();
  const now = new Date();
  const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  const [tables, presences, reports] = await Promise.all([
    prisma.table.findMany({
      where: { status: "ACTIVE" },
      orderBy: { tableCode: "asc" },
      select: {
        tableCode: true,
        displayName: true,
        sessions: {
          where: { status: { not: "ENDED" } },
          orderBy: { createdAt: "desc" },
          take: 1,
          select: {
            sessionCode: true,
            status: true,
            mode: true,
            createdAt: true,
            startedAt: true,
            participants: { select: { displayName: true } },
          },
        },
      },
    }),
    prisma.openPresence.findMany({
      where: { status: { in: ["OPEN", "PAUSED"] }, expiresAt: { gt: now } },
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        displayName: true,
        status: true,
        createdAt: true,
        expiresAt: true,
        table: { select: { tableCode: true } },
        _count: { select: { reportsGot: true } },
      },
    }),
    prisma.spillReport.findMany({
      where: { OR: [{ status: "OPEN" }, { createdAt: { gte: dayAgo } }] },
      orderBy: { createdAt: "desc" },
      take: 100,
      select: {
        id: true,
        reason: true,
        note: true,
        status: true,
        createdAt: true,
        reporter: {
          select: { displayName: true, table: { select: { tableCode: true } } },
        },
        reported: {
          select: {
            id: true,
            displayName: true,
            status: true,
            table: { select: { tableCode: true } },
          },
        },
      },
    }),
  ]);

  return NextResponse.json({
    serverTime: now,
    tables: tables.map((t) => {
      const s = t.sessions[0];
      const live = s && !isSessionStale(s) ? s : null;
      return {
        tableCode: t.tableCode,
        displayName: t.displayName,
        state: !live
          ? "FREE"
          : live.status === "ACTIVE" || live.status === "ENDING"
            ? "PLAYING"
            : "WAITING",
        sessionCode: live?.sessionCode ?? null,
        players: live?.participants.map((p) => p.displayName) ?? [],
      };
    }),
    open: presences.map((p) => ({
      id: p.id,
      displayName: p.displayName,
      status: p.status,
      tableCode: p.table.tableCode,
      openMinutes: Math.floor((now.getTime() - p.createdAt.getTime()) / 60_000),
      minutesLeft: Math.max(
        0,
        Math.ceil((p.expiresAt.getTime() - now.getTime()) / 60_000),
      ),
      reports: p._count.reportsGot,
    })),
    reports: reports.map((r) => ({
      id: r.id,
      reason: r.reason,
      note: r.note,
      status: r.status,
      createdAt: r.createdAt,
      reporter: {
        name: r.reporter.displayName,
        tableCode: r.reporter.table.tableCode,
      },
      reported: {
        id: r.reported.id,
        name: r.reported.displayName,
        tableCode: r.reported.table.tableCode,
        stillOpen:
          r.reported.status === "OPEN" || r.reported.status === "PAUSED",
      },
    })),
  });
}
