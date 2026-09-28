

import { config } from "dotenv";
config({ path: ".env.local" });

import { REAL_TABLES } from "./tables.config";

const DRY_RUN = process.argv.includes("--dry-run");

async function main() {
  // Dynamic import: prisma.ts must load AFTER dotenv has set DATABASE_URL.
  const { prisma } = await import("../src/lib/prisma");

  let created = 0;
  let existing = 0;
  let skipped = 0;

  try {
    for (const group of REAL_TABLES) {
      for (const t of group.tables) {
        if (t.tableCode.toUpperCase().startsWith("TEST")) {
          throw new Error(
            `"${t.tableCode}" dùng tiền tố TEST dành cho bàn thử nghiệm.`,
          );
        }
        if (t.tableCode !== t.tableCode.toUpperCase()) {
          throw new Error(`Mã bàn phải viết HOA: "${t.tableCode}".`);
        }
      }

      let venue = await prisma.venue.findFirst({
        where: { name: group.venue.name, city: group.venue.city },
      });

      if (!venue) {
        console.log(`+ Venue mới: ${group.venue.name} (${group.venue.city})`);
        if (!DRY_RUN) {
          venue = await prisma.venue.create({
            data: { ...group.venue, status: "ACTIVE" },
          });
        }
      } else {
        console.log(`= Venue có sẵn: ${venue.name} (${venue.city})`);
      }

      for (const t of group.tables) {
        const sameCode = await prisma.table.findFirst({
          where: { tableCode: t.tableCode },
          include: { venue: true },
        });

        if (sameCode && venue && sameCode.venueId === venue.id) {
          existing++;
          console.log(`  = ${t.tableCode} đã có (${sameCode.displayName})`);
          continue;
        }
        if (sameCode) {
          skipped++;
          console.warn(
            `  ! ${t.tableCode} đã thuộc venue khác (${sameCode.venue.name}) — bỏ qua.`,
          );
          continue;
        }

        created++;
        console.log(`  + ${t.tableCode} · ${t.displayName}`);
        if (!DRY_RUN && venue) {
          await prisma.table.create({
            data: {
              venueId: venue.id,
              tableCode: t.tableCode,
              displayName: t.displayName,
              status: "ACTIVE",
            },
          });
        }
      }
    }

    console.log(
      `\n${DRY_RUN ? "[DRY RUN] Sẽ tạo" : "Đã tạo"} ${created} bàn · ${existing} bàn đã có · ${skipped} bỏ qua.`,
    );
    if (DRY_RUN)
      console.log("Chạy lại không có --dry-run để ghi vào database.");
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
