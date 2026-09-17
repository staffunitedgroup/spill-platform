-- CreateEnum
CREATE TYPE "VenueStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "TableStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "SessionMode" AS ENUM ('TWO_PERSON');

-- CreateEnum
CREATE TYPE "SessionStatus" AS ENUM ('WAITING', 'READY', 'ACTIVE', 'ENDING', 'ENDED');

-- CreateEnum
CREATE TYPE "ParticipantStatus" AS ENUM ('WAITING', 'ACTIVE', 'COMPLETED');

-- CreateEnum
CREATE TYPE "ConnectionType" AS ENUM ('FRIENDS_ONLY', 'FRIENDS', 'MAYBE_MORE', 'ALREADY_TOGETHER');

-- CreateEnum
CREATE TYPE "SpillType" AS ENUM ('QUESTION', 'INSTRUCTION', 'CHALLENGE', 'OBSERVATION', 'SCENARIO', 'VISION');

-- CreateEnum
CREATE TYPE "ConnectionStatus" AS ENUM ('MUTUAL', 'NONE');

-- CreateTable
CREATE TABLE "venues" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "status" "VenueStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "venues_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tables" (
    "id" TEXT NOT NULL,
    "venue_id" TEXT NOT NULL,
    "table_code" TEXT NOT NULL,
    "display_name" TEXT NOT NULL,
    "status" "TableStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tables_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "table_id" TEXT NOT NULL,
    "session_code" TEXT NOT NULL,
    "mode" "SessionMode" NOT NULL DEFAULT 'TWO_PERSON',
    "status" "SessionStatus" NOT NULL DEFAULT 'WAITING',
    "started_at" TIMESTAMP(3),
    "ended_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "participants" (
    "id" TEXT NOT NULL,
    "session_id" TEXT NOT NULL,
    "display_name" TEXT NOT NULL,
    "participant_token" TEXT NOT NULL,
    "joined_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "left_at" TIMESTAMP(3),
    "status" "ParticipantStatus" NOT NULL DEFAULT 'WAITING',

    CONSTRAINT "participants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "connection_selections" (
    "id" TEXT NOT NULL,
    "session_id" TEXT NOT NULL,
    "participant_id" TEXT NOT NULL,
    "connection_type" "ConnectionType" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "connection_selections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "spills" (
    "id" TEXT NOT NULL,
    "type" "SpillType" NOT NULL,
    "content" TEXT NOT NULL,
    "category" TEXT,
    "difficulty" INTEGER,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "spills_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "session_spills" (
    "id" TEXT NOT NULL,
    "session_id" TEXT NOT NULL,
    "spill_id" TEXT NOT NULL,
    "sequence" INTEGER NOT NULL,
    "presented_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),

    CONSTRAINT "session_spills_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "connections" (
    "id" TEXT NOT NULL,
    "session_id" TEXT NOT NULL,
    "participant_a_id" TEXT NOT NULL,
    "participant_b_id" TEXT NOT NULL,
    "status" "ConnectionStatus" NOT NULL DEFAULT 'NONE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "connections_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tables_venue_id_table_code_key" ON "tables"("venue_id", "table_code");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_session_code_key" ON "sessions"("session_code");

-- CreateIndex
CREATE UNIQUE INDEX "participants_participant_token_key" ON "participants"("participant_token");

-- CreateIndex
CREATE UNIQUE INDEX "connection_selections_session_id_participant_id_key" ON "connection_selections"("session_id", "participant_id");

-- CreateIndex
CREATE UNIQUE INDEX "session_spills_session_id_sequence_key" ON "session_spills"("session_id", "sequence");

-- AddForeignKey
ALTER TABLE "tables" ADD CONSTRAINT "tables_venue_id_fkey" FOREIGN KEY ("venue_id") REFERENCES "venues"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_table_id_fkey" FOREIGN KEY ("table_id") REFERENCES "tables"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "participants" ADD CONSTRAINT "participants_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "sessions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "connection_selections" ADD CONSTRAINT "connection_selections_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "sessions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "connection_selections" ADD CONSTRAINT "connection_selections_participant_id_fkey" FOREIGN KEY ("participant_id") REFERENCES "participants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session_spills" ADD CONSTRAINT "session_spills_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "sessions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session_spills" ADD CONSTRAINT "session_spills_spill_id_fkey" FOREIGN KEY ("spill_id") REFERENCES "spills"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "connections" ADD CONSTRAINT "connections_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "sessions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
