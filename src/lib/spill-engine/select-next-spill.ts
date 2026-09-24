import { prisma } from "@/lib/prisma";
import type { ConnectionType } from "@/generated/prisma/enums";

export async function selectNextSpill(
  sessionId: string,
  resolvedConnectionType: ConnectionType | null,
) {
  const usedSpillIds = (
    await prisma.sessionSpill.findMany({
      where: { sessionId },
      select: { spillId: true },
    })
  ).map((s) => s.spillId);

  const candidates = await prisma.spill.findMany({
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

  const randomIndex = Math.floor(Math.random() * lowestTier.length);
  return lowestTier[randomIndex];
}
