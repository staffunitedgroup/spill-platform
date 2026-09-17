import type { ConnectionType } from "@/generated/prisma/enums";

const INTIMACY_RANK: Record<ConnectionType, number> = {
  FRIENDS_ONLY: 0,
  FRIENDS: 1,
  MAYBE_MORE: 2,
  ALREADY_TOGETHER: 3,
};

export function resolveConnectionType(
  a: ConnectionType,
  b: ConnectionType,
): ConnectionType {
  return INTIMACY_RANK[a] <= INTIMACY_RANK[b] ? a : b;
}
