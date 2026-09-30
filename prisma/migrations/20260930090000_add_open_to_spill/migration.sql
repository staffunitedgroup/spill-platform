-- SPILL 42 Phase 2 · "Meet someone new".
-- Additive only: two new tables + two new enums. Nothing existing changes.

-- CreateEnum
CREATE TYPE "OpenPresenceStatus" AS ENUM ('OPEN', 'MATCHED', 'CLOSED');

-- CreateEnum
CREATE TYPE "SpillInviteStatus" AS ENUM ('PENDING', 'ACCEPTED', 'DECLINED', 'EXPIRED', 'CANCELLED');

-- CreateTable
CREATE TABLE "open_presences" (
    "id" TEXT NOT NULL,
    "table_id" TEXT NOT NULL,
    "display_name" TEXT NOT NULL,
    "presence_token" TEXT NOT NULL,
    "status" "OpenPresenceStatus" NOT NULL DEFAULT 'OPEN',
    "age_confirmed_at" TIMESTAMP(3) NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "session_id" TEXT,
    "participant_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "open_presences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "spill_invites" (
    "id" TEXT NOT NULL,
    "from_id" TEXT NOT NULL,
    "to_id" TEXT NOT NULL,
    "status" "SpillInviteStatus" NOT NULL DEFAULT 'PENDING',
    "expires_at" TIMESTAMP(3) NOT NULL,
    "responded_at" TIMESTAMP(3),
    "session_id" TEXT,
    "meet_color" TEXT,
    "meet_code" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "spill_invites_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "open_presences_presence_token_key" ON "open_presences"("presence_token");

-- CreateIndex
CREATE INDEX "open_presences_status_expires_at_idx" ON "open_presences"("status", "expires_at");

-- CreateIndex
CREATE INDEX "spill_invites_to_id_status_idx" ON "spill_invites"("to_id", "status");

-- CreateIndex
CREATE INDEX "spill_invites_from_id_status_idx" ON "spill_invites"("from_id", "status");

-- AddForeignKey
ALTER TABLE "open_presences" ADD CONSTRAINT "open_presences_table_id_fkey" FOREIGN KEY ("table_id") REFERENCES "tables"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "open_presences" ADD CONSTRAINT "open_presences_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "sessions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "open_presences" ADD CONSTRAINT "open_presences_participant_id_fkey" FOREIGN KEY ("participant_id") REFERENCES "participants"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "spill_invites" ADD CONSTRAINT "spill_invites_from_id_fkey" FOREIGN KEY ("from_id") REFERENCES "open_presences"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "spill_invites" ADD CONSTRAINT "spill_invites_to_id_fkey" FOREIGN KEY ("to_id") REFERENCES "open_presences"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "spill_invites" ADD CONSTRAINT "spill_invites_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "sessions"("id") ON DELETE SET NULL ON UPDATE CASCADE;