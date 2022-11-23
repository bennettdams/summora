-- DropForeignKey
ALTER TABLE "PostSegment" DROP CONSTRAINT "PostSegment_postId_fkey";

-- DropForeignKey
ALTER TABLE "PostSegmentItem" DROP CONSTRAINT "PostSegmentItem_postSegmentId_fkey";

-- AddForeignKey
ALTER TABLE "PostSegment" ADD CONSTRAINT "PostSegment_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostSegmentItem" ADD CONSTRAINT "PostSegmentItem_postSegmentId_fkey" FOREIGN KEY ("postSegmentId") REFERENCES "PostSegment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
