

import { config } from "dotenv";
config({ path: ".env.local" });

const TEST_TABLES = [
  { tableCode: "TEST01", displayName: "Table 1" },
  { tableCode: "TEST02", displayName: "Table 2" },
];

async function main() {
  // Dynamic import: đảm bảo prisma.ts chỉ được nạp SAU khi config() đã
  // chạy xong. Nếu dùng static import ở đầu file, ESM sẽ hoist nó lên
  // chạy TRƯỚC config(), khiến DATABASE_URL vẫn undefined lúc adapter
  // được khởi tạo bên trong prisma.ts — đây chính là nguyên nhân lỗi
  // "User was denied access" dù connection string hoàn toàn đúng.
  const { prisma } = await import("../src/lib/prisma");

  try {
    const codes = TEST_TABLES.map((t) => t.tableCode);
    const testSessions = await prisma.session.findMany({
      where: { table: { tableCode: { in: codes } } },
      select: { id: true },
    });
    const sessionIds = testSessions.map((s) => s.id);

    console.log(`Cleaning ${sessionIds.length} test session(s)...`);
    const bySession = { where: { sessionId: { in: sessionIds } } };
    await prisma.sessionSpill.deleteMany(bySession);
    await prisma.connection.deleteMany(bySession);
    await prisma.connectionSelection.deleteMany(bySession);
    await prisma.participant.deleteMany(bySession);
    await prisma.session.deleteMany({ where: { id: { in: sessionIds } } });

    let venue = await prisma.venue.findFirst({
      where: { name: "SPILL Saigon", city: "Saigon" },
    });
    if (!venue) {
      venue = await prisma.venue.create({
        data: { name: "SPILL Saigon", city: "Saigon", status: "ACTIVE" },
      });
      console.log("Created venue:", venue.name);
    }

    for (const t of TEST_TABLES) {
      const table = await prisma.table.upsert({
        where: {
          venueId_tableCode: { venueId: venue.id, tableCode: t.tableCode },
        },
        create: { venueId: venue.id, ...t, status: "ACTIVE" },
        update: { status: "ACTIVE" },
      });
      console.log(`Ready: ${table.tableCode} (${table.displayName})`);
    }

    console.log("Test tables reset. Real tables untouched.");
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
