export type DevicePlayer = {
  sessionId: string;
  sessionCode: string;
  token: string;
  name: string;
  homeTable?: string;
};

const key = (sessionCode: string) => `spill:${sessionCode}:me`;

export function loadMe(sessionCode: string): DevicePlayer | null {
  try {
    const raw = localStorage.getItem(key(sessionCode));
    if (!raw) return null;
    const me = JSON.parse(raw) as DevicePlayer;
    return me &&
      typeof me.token === "string" &&
      typeof me.sessionId === "string"
      ? me
      : null;
  } catch {
    return null;
  }
}

export function saveMe(me: DevicePlayer) {
  try {
    localStorage.setItem(key(me.sessionCode), JSON.stringify(me));
  } catch {
    /* private mode — the game still works until the tab is closed */
  }
}

export function clearMe(sessionCode: string) {
  try {
    localStorage.removeItem(key(sessionCode));
  } catch {
    /* ignore */
  }
}
