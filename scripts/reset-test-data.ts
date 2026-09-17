import { config } from "dotenv";
config({ path: ".env.local" });

import { prisma } from "../src/lib/prisma";

async function main() {
  console.log("Cleaning up in dependency order...");

  await prisma.sessionSpill.deleteMany({});
  await prisma.connection.deleteMany({});
  await prisma.connectionSelection.deleteMany({});
  await prisma.participant.deleteMany({});
  await prisma.session.deleteMany({});
  await prisma.table.deleteMany({});
  await prisma.venue.deleteMany({});

  console.log("All test data wiped clean.");

  const venue = await prisma.venue.create({
    data: {
      name: "SPILL Saigon",
      city: "Saigon",
      status: "ACTIVE",
    },
  });

  const table1 = await prisma.table.create({
    data: {
      venueId: venue.id,
      tableCode: "TEST01",
      displayName: "Table 1",
      status: "ACTIVE",
    },
  });

  const table2 = await prisma.table.create({
    data: {
      venueId: venue.id,
      tableCode: "TEST02",
      displayName: "Table 2",
      status: "ACTIVE",
    },
  });

  console.log("Created venue:", venue);
  console.log("Created table1:", table1);
  console.log("Created table2:", table2);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
