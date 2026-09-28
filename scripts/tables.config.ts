// ─────────────────────────────────────────────────────────────
// Danh sách BÀN THẬT của từng chi nhánh SPILL.
// Sửa file này khi quán thêm / bớt bàn, rồi chạy lại:
//   npx tsx scripts/seed-real-tables.ts      (tạo bàn trong database)
//   npx tsx scripts/generate-table-qr.ts     (xuất mã QR để in)
//
// Quy tắc mã bàn (tableCode):
//   <MÃ CHI NHÁNH><SỐ BÀN 2 chữ số>  →  SGN01, SGN02, … HAN01, TYO01…
//   Mã bàn phải DUY NHẤT trên toàn hệ thống (API tìm bàn chỉ theo mã).
//   Không dùng tiền tố "TEST" — đó là bàn thử nghiệm.
// ─────────────────────────────────────────────────────────────

export type RealTable = {
  tableCode: string;
  displayName: string;
};

export type VenueTables = {
  venue: { name: string; city: string };
  prefix: string;
  tables: RealTable[];
};

/** Tạo nhanh N bàn: SGN01 … SGN{N}. */
function numbered(prefix: string, count: number): RealTable[] {
  return Array.from({ length: count }, (_, i) => {
    const n = String(i + 1).padStart(2, "0");
    return { tableCode: `${prefix}${n}`, displayName: `Table ${n}` };
  });
}

export const REAL_TABLES: VenueTables[] = [
  {
    venue: { name: "SPILL Saigon", city: "Saigon" },
    prefix: "SGN",
    // 👉 Đổi số 20 thành số bàn thật của quán.
    // Muốn đặt tên riêng thì thay bằng danh sách, ví dụ:
    //   tables: [{ tableCode: "SGN01", displayName: "Window 1" }, …]
    tables: numbered("SGN", 20),
  },
];

/** Link mà mã QR trỏ tới. Đổi nếu dùng tên miền khác. */
export const DEFAULT_BASE_URL = "https://spillcafebar.com";

export function tableUrl(baseUrl: string, tableCode: string) {
  return `${baseUrl.replace(/\/+$/, "")}/spill/table/${tableCode}`;
}
