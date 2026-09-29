export const WAITING_READY_TIMEOUT_MIN = 15;
export const ACTIVE_TIMEOUT_MIN = 90;

export function isSessionStale(session: {
  status: string;
  createdAt: Date;
  startedAt: Date | null;
}): boolean {
  const active = session.status === "ACTIVE" || session.status === "ENDING";
  const reference =
    active && session.startedAt ? session.startedAt : session.createdAt;
  const timeoutMin = active ? ACTIVE_TIMEOUT_MIN : WAITING_READY_TIMEOUT_MIN;
  return Date.now() - reference.getTime() > timeoutMin * 60 * 1000;
}

export function maxParticipantsFor(session: {
  mode: string;
  groupSize: number | null;
}): number {
  return session.mode === "GROUP" ? (session.groupSize ?? 6) : 2;
}
