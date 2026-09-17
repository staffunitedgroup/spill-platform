// scripts/seed-test.ts
// Chạy: npx tsx scripts/seed-test.ts

import { config } from "dotenv";
config({ path: ".env.local" });

import { prisma } from "../src/lib/prisma";

async function main() {
  // Xoá dữ liệu test cũ (nếu có) để chạy lại nhiều lần không lỗi trùng
  await prisma.session.deleteMany({});
  await prisma.table.deleteMany({ where: { tableCode: "TEST01" } });
  await prisma.venue.deleteMany({ where: { name: "SPILL Saigon" } });

  const venue = await prisma.venue.create({
    data: {
      name: "SPILL Saigon",
      city: "Saigon",
      status: "ACTIVE",
    },
  });

  const table = await prisma.table.create({
    data: {
      venueId: venue.id,
      tableCode: "TEST01",
      displayName: "Table 1",
      status: "ACTIVE",
    },
  });

  console.log("Created venue:", venue);
  console.log("Created table:", table);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
