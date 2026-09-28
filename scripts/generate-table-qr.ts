

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import QRCode from "qrcode";
import {
  DEFAULT_BASE_URL,
  REAL_TABLES,
  tableUrl,
  type RealTable,
} from "./tables.config";

function argValue(name: string): string | undefined {
  const i = process.argv.indexOf(name);
  return i >= 0 ? process.argv[i + 1] : undefined;
}

const BASE_URL = argValue("--base-url") ?? DEFAULT_BASE_URL;
const INCLUDE_TEST = process.argv.includes("--include-test");
const OUT_DIR = path.join(process.cwd(), "qr-codes");

// SPILL Saigon palette
const NEAR_BLACK = "#111111";
const RED = "#E8472F";

function escapeHtml(s: string) {
  return s.replace(/[&<>"]/g, (c) =>
    c === "&" ? "&amp;" : c === "<" ? "&lt;" : c === ">" ? "&gt;" : "&quot;",
  );
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });

  const tables: (RealTable & { venue: string })[] = REAL_TABLES.flatMap((g) =>
    g.tables.map((t) => ({ ...t, venue: g.venue.name })),
  );
  if (INCLUDE_TEST) {
    tables.push(
      { tableCode: "TEST01", displayName: "Test 1", venue: "SPILL Saigon" },
      { tableCode: "TEST02", displayName: "Test 2", venue: "SPILL Saigon" },
    );
  }

  const [wordmark, font] = await Promise.all([
    readFile(path.join("public/assets/spill/brand/wordmark-bright.png")),
    readFile(path.join("public/assets/spill/fonts/neuropol-x.otf")),
  ]);

  const cards: string[] = [];
  for (const t of tables) {
    const url = tableUrl(BASE_URL, t.tableCode);
    const qrOptions = {
      errorCorrectionLevel: "H" as const, // survives coffee stains & scratches
      margin: 2,
      color: { dark: NEAR_BLACK, light: "#FFFFFF" },
    };

    await QRCode.toFile(path.join(OUT_DIR, `${t.tableCode}.png`), url, {
      ...qrOptions,
      width: 1200,
    });
    const svg = await QRCode.toString(url, { ...qrOptions, type: "svg" });

    const number = t.displayName.replace(/^Table\s*/i, "");
    cards.push(`
      <article class="card">
        <div class="wordmark" role="img" aria-label="SPILL"></div>
        <div class="game">SPILL <b>42</b></div>
        <div class="qr">${svg}</div>
        <div class="info">
          <div class="scan">Scan to play</div>
          <div class="table"><span>Table</span><strong>${escapeHtml(number)}</strong></div>
          <div class="code">${escapeHtml(t.tableCode)} · ${escapeHtml(new URL(url).host)}</div>
        </div>
      </article>`);
  }

  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>SPILL 42 — Table QR codes</title>
<style>
  @font-face {
    font-family: "Neuropol X";
    src: url(data:font/otf;base64,${font.toString("base64")}) format("opentype");
  }
  @page { size: A4; margin: 10mm; }
  * { box-sizing: border-box; }
  body {
    margin: 0;
    background: #e9e9e9;
    font-family: "Neuropol X", "Space Grotesk", Arial, sans-serif;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  .sheet {
    width: 190mm;
    margin: 0 auto;
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 6mm;
    padding: 6mm 0;
  }
  .card {
    height: 88mm;
    padding: 6mm;
    display: grid;
    grid-template-columns: 44mm 1fr;
    grid-template-rows: auto auto 1fr;
    column-gap: 5mm;
    border-radius: 4mm;
    background: ${NEAR_BLACK};
    color: #fff;
    break-inside: avoid;
    border: 0.6mm solid ${RED};
  }
  .wordmark {
    grid-column: 1 / -1;
    height: 7mm;
    background: url(data:image/png;base64,${wordmark.toString("base64")}) left center / contain no-repeat;
  }
  .game {
    grid-column: 1 / -1;
    margin: 2mm 0 4mm;
    color: #C0C4C8;
    font-size: 9pt;
    letter-spacing: 0.25em;
  }
  .game b { color: ${RED}; font-weight: 400; }
  .qr {
    align-self: end;
    padding: 1.5mm;
    border-radius: 2mm;
    background: #fff;
  }
  .qr svg { display: block; width: 100%; height: auto; }
  .info {
    min-width: 0;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    gap: 2.5mm;
  }
  .scan {
    color: ${RED};
    font-size: 7.5pt;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    white-space: nowrap;
  }
  .table { display: grid; gap: 1mm; }
  .table span {
    color: #C0C4C8;
    font-size: 7.5pt;
    letter-spacing: 0.2em;
    text-transform: uppercase;
  }
  .table strong { font-size: 40pt; font-weight: 400; line-height: 0.9; }
  .code {
    color: #C0C4C8;
    font-family: Arial, sans-serif;
    font-size: 6.5pt;
    line-height: 1.4;
    word-break: break-all;
  }
  @media print { body { background: none; } .sheet { padding: 0; } }
</style>
</head>
<body>
<main class="sheet">${cards.join("")}</main>
</body>
</html>`;

  await writeFile(path.join(OUT_DIR, "print.html"), html, "utf8");

  console.log(`QR codes → ${BASE_URL}/spill/table/<CODE>`);
  console.log(`Đã tạo ${tables.length} mã QR trong ${OUT_DIR}`);
  console.log(
    `Mở qr-codes/print.html bằng Chrome → In (Ctrl/Cmd+P) → Lưu PDF.`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
