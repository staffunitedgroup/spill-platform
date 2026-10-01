-- SPILL 42 Phase 2 · Pause + Report. Additive only.

-- AlterEnum
ALTER TYPE "OpenPresenceStatus" ADD VALUE 'PAUSED';

-- CreateEnum
CREATE TYPE "SpillReportReason" AS ENUM ('UNCOMFORTABLE', 'INAPPROPRIATE_NAME', 'SPAM', 'OTHER');

-- CreateEnum
CREATE TYPE "SpillReportStatus" AS ENUM ('OPEN', 'RESOLVED');

-- CreateTable
CREATE TABLE "spill_reports" (
    "id" TEXT NOT NULL,
    "reporter_id" TEXT NOT NULL,
    "reported_id" TEXT NOT NULL,
    "reason" "SpillReportReason" NOT NULL,
    "note" TEXT,
    "status" "SpillReportStatus" NOT NULL DEFAULT 'OPEN',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolved_at" TIMESTAMP(3),

    CONSTRAINT "spill_reports_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "spill_reports_status_created_at_idx" ON "spill_reports"("status", "created_at");

-- CreateIndex
CREATE INDEX "spill_reports_reported_id_idx" ON "spill_reports"("reported_id");

-- AddForeignKey
ALTER TABLE "spill_reports" ADD CONSTRAINT "spill_reports_reporter_id_fkey" FOREIGN KEY ("reporter_id") REFERENCES "open_presences"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "spill_reports" ADD CONSTRAINT "spill_reports_reported_id_fkey" FOREIGN KEY ("reported_id") REFERENCES "open_presences"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
