/*
  Warnings:

  - You are about to drop the column `segmentNo` on the `PostSegment` table. All the data in the column will be lost.
  - You are about to drop the column `itemNo` on the `PostSegmentItem` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "PostSegment" DROP COLUMN "segmentNo";

-- AlterTable
ALTER TABLE "PostSegmentItem" DROP COLUMN "itemNo";
