-- AlterTable
ALTER TABLE "Document" ADD COLUMN     "isDeleted" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "content" SET DEFAULT '';
