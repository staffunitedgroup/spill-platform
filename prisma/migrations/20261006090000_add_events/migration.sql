-- CreateEnum
CREATE TYPE "EventCategory" AS ENUM ('SPILL42', 'MUSIC', 'LIVE', 'FOOD_DRINK', 'COMMUNITY', 'SPECIAL');

-- CreateTable
CREATE TABLE "events" (
    "id" TEXT NOT NULL,
    "location_slug" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "category" "EventCategory" NOT NULL,
    "starts_at" TIMESTAMP(3) NOT NULL,
    "ends_at" TIMESTAMP(3),
    "image_url" TEXT,
    "ticket_url" TEXT,
    "youtube_url" TEXT,
    "rsvp_enabled" BOOLEAN NOT NULL DEFAULT true,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "event_rsvps" (
    "id" TEXT NOT NULL,
    "event_id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "whatsapp" TEXT,
    "party_size" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "event_rsvps_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "events_location_slug_published_starts_at_idx" ON "events"("location_slug", "published", "starts_at");

-- CreateIndex
CREATE UNIQUE INDEX "events_location_slug_slug_key" ON "events"("location_slug", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "event_rsvps_event_id_email_key" ON "event_rsvps"("event_id", "email");

-- AddForeignKey
ALTER TABLE "event_rsvps" ADD CONSTRAINT "event_rsvps_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;
