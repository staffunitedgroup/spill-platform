-- SPILL 42 Phase 3 · Stay Connected (email sign-in, connections, notifications).
-- Additive only: 4 new tables + 2 nullable columns. Nothing existing changes.

-- AlterTable
ALTER TABLE "participants" ADD COLUMN "guest_id" TEXT;

-- AlterTable
ALTER TABLE "open_presences" ADD COLUMN "guest_id" TEXT;

-- CreateTable
CREATE TABLE "guests" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "display_name" TEXT,
    "email_notifications" BOOLEAN NOT NULL DEFAULT true,
    "notifications_paused" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "guests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "login_tokens" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "token_hash" TEXT NOT NULL,
    "participant_id" TEXT,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "used_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "login_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "spill_connections" (
    "id" TEXT NOT NULL,
    "guest_a_id" TEXT NOT NULL,
    "guest_b_id" TEXT NOT NULL,
    "name_a" TEXT NOT NULL,
    "name_b" TEXT NOT NULL,
    "session_id" TEXT,
    "muted_by_a" BOOLEAN NOT NULL DEFAULT false,
    "muted_by_b" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "spill_connections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "spill_notifications" (
    "id" TEXT NOT NULL,
    "to_guest_id" TEXT NOT NULL,
    "about_guest_id" TEXT NOT NULL,
    "about_name" TEXT NOT NULL,
    "venue_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "seen_at" TIMESTAMP(3),
    "emailed_at" TIMESTAMP(3),

    CONSTRAINT "spill_notifications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "guests_email_key" ON "guests"("email");

-- CreateIndex
CREATE UNIQUE INDEX "login_tokens_token_hash_key" ON "login_tokens"("token_hash");

-- CreateIndex
CREATE INDEX "login_tokens_email_created_at_idx" ON "login_tokens"("email", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "spill_connections_guest_a_id_guest_b_id_key" ON "spill_connections"("guest_a_id", "guest_b_id");

-- CreateIndex
CREATE INDEX "spill_notifications_to_guest_id_created_at_idx" ON "spill_notifications"("to_guest_id", "created_at");

-- CreateIndex
CREATE INDEX "spill_notifications_about_guest_id_to_guest_id_created_at_idx" ON "spill_notifications"("about_guest_id", "to_guest_id", "created_at");

-- AddForeignKey
ALTER TABLE "participants" ADD CONSTRAINT "participants_guest_id_fkey" FOREIGN KEY ("guest_id") REFERENCES "guests"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "open_presences" ADD CONSTRAINT "open_presences_guest_id_fkey" FOREIGN KEY ("guest_id") REFERENCES "guests"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "login_tokens" ADD CONSTRAINT "login_tokens_participant_id_fkey" FOREIGN KEY ("participant_id") REFERENCES "participants"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "spill_connections" ADD CONSTRAINT "spill_connections_guest_a_id_fkey" FOREIGN KEY ("guest_a_id") REFERENCES "guests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "spill_connections" ADD CONSTRAINT "spill_connections_guest_b_id_fkey" FOREIGN KEY ("guest_b_id") REFERENCES "guests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "spill_notifications" ADD CONSTRAINT "spill_notifications_to_guest_id_fkey" FOREIGN KEY ("to_guest_id") REFERENCES "guests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "spill_notifications" ADD CONSTRAINT "spill_notifications_about_guest_id_fkey" FOREIGN KEY ("about_guest_id") REFERENCES "guests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "spill_notifications" ADD CONSTRAINT "spill_notifications_venue_id_fkey" FOREIGN KEY ("venue_id") REFERENCES "venues"("id") ON DELETE SET NULL ON UPDATE CASCADE;
