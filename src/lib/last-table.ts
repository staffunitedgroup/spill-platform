// Remembers the last table this phone scanned, so pages outside a table
// (like /spill/me) can send people back to it.
const KEY = "spill:lastTable";

export function rememberTable(tableCode: string) {
  try {
    localStorage.setItem(KEY, tableCode.toUpperCase());
  } catch {
    /* private mode */
  }
}

export function lastTable(): string | null {
  try {
    const saved = localStorage.getItem(KEY);
    if (saved) return saved;
    // Phones that played before this was added: fall back to what they
    // already stored — an Open spot, or the home table of a past game.
    const open = JSON.parse(localStorage.getItem("spill:open") ?? "null");
    if (open && typeof open.tableCode === "string") return open.tableCode;
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (!k || !/^spill:.+:me$/.test(k)) continue;
      const me = JSON.parse(localStorage.getItem(k) ?? "null");
      if (me && typeof me.homeTable === "string") return me.homeTable;
    }
    return null;
  } catch {
    return null;
  }
}
