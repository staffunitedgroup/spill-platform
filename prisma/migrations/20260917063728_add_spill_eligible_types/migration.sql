-- AlterTable
ALTER TABLE "spills" ADD COLUMN     "eligible_types" "ConnectionType"[] DEFAULT ARRAY[]::"ConnectionType"[];
