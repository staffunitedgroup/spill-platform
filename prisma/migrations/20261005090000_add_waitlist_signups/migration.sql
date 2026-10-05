-- CreateTable
CREATE TABLE "waitlist_signups" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "whatsapp" TEXT,
    "location_slug" TEXT NOT NULL,
    "interests" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "source" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "waitlist_signups_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "waitlist_signups_location_slug_created_at_idx" ON "waitlist_signups"("location_slug", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "waitlist_signups_email_location_slug_key" ON "waitlist_signups"("email", "location_slug");
