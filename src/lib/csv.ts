/** One CSV cell: always quoted, and safe to open in Excel / Google Sheets. */
export function csvCell(value: string | number | null | undefined) {
  const text = value == null ? "" : String(value);
  // Neutralise spreadsheet formulas (=, @, or +/- not followed by a plain
  // phone number like "+84 90 123 4567").
  const isFormula = /^[=@\t\r]/.test(text) || (/^[+-]/.test(text) && !/^[+-][\d\s().-]*$/.test(text));
  const safe = isFormula ? `'${text}` : text;
  return `"${safe.replaceAll('"', '""')}"`;
}

/** A CSV download response; the BOM makes Excel read Vietnamese names correctly. */
export function csvResponse(filename: string, header: string[], rows: Array<Array<string | number | null | undefined>>) {
  const body = "﻿" + [header, ...rows].map((row) => row.map(csvCell).join(",")).join("\r\n");
  return new Response(body, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
