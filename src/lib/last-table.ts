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
    return localStorage.getItem(KEY);
  } catch {
    return null;
  }
}
