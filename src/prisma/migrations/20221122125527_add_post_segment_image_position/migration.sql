-- CreateEnum
CREATE TYPE "PostSegmentImagePosition" AS ENUM ('RIGHT', 'BOTTOM');

-- AlterTable
ALTER TABLE "PostSegment" ADD COLUMN     "position" "PostSegmentImagePosition" NOT NULL DEFAULT 'RIGHT';
