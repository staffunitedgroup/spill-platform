-- AlterEnum
ALTER TYPE "SessionMode" ADD VALUE 'GROUP';

-- AlterTable
ALTER TABLE "sessions" ADD COLUMN     "group_size" INTEGER;
