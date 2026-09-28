import { prisma } from "@/lib/prisma";
import type { ConnectionType } from "@/generated/prisma/enums";

type Db = Pick<typeof prisma, "sessionSpill" | "spill">;


export async function selectNextSpill(
  sessionId: string,
  resolvedConnectionType: ConnectionType | null,
  db: Db = prisma,
) {
  const used = await db.sessionSpill.findMany({
    where: { sessionId },
    select: {
      spillId: true,
      sequence: true,
      spill: { select: { type: true } },
    },
    orderBy: { sequence: "desc" },
  });
  const usedSpillIds = used.map((s) => s.spillId);
  const lastType = used[0]?.spill.type ?? null;

  const candidates = await db.spill.findMany({
    where: {
      active: true,
      id: { notIn: usedSpillIds },
      ...(resolvedConnectionType
        ? {
            OR: [
              { eligibleTypes: { isEmpty: true } },
              { eligibleTypes: { has: resolvedConnectionType } },
            ],
          }
        : {}),
    },
    orderBy: [{ difficulty: "asc" }],
  });

  if (candidates.length === 0) {
    return null;
  }

  const lowestDifficulty = candidates[0].difficulty ?? 0;
  const lowestTier = candidates.filter(
    (c) => (c.difficulty ?? 0) === lowestDifficulty,
  );

  const varied = lastType
    ? lowestTier.filter((c) => c.type !== lastType)
    : lowestTier;
  const pool = varied.length > 0 ? varied : lowestTier;

  return pool[Math.floor(Math.random() * pool.length)];
}
