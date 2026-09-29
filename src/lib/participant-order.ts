// Stable player order shared by server and every phone: join time, then id.
// Spotlight index N always means the N-th player in this order.
export function orderParticipants<T extends { joinedAt: Date; id: string }>(
  participants: T[],
): T[] {
  return [...participants].sort(
    (a, b) =>
      a.joinedAt.getTime() - b.joinedAt.getTime() || a.id.localeCompare(b.id),
  );
}
