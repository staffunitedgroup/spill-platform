export type DeviceOpen = {
  id: string;
  token: string;
  displayName: string;
  tableCode: string;
};

const KEY = "spill:open";

export function loadOpen(): DeviceOpen | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const d = JSON.parse(raw) as DeviceOpen;
    return d && typeof d.token === "string" && typeof d.id === "string"
      ? d
      : null;
  } catch {
    return null;
  }
}

export function saveOpen(d: DeviceOpen) {
  try {
    localStorage.setItem(KEY, JSON.stringify(d));
  } catch {}
}

export function clearOpen() {
  try {
    localStorage.removeItem(KEY);
  } catch {}
}

export function lastOpenName(): string {
  return loadOpen()?.displayName ?? "";
}
