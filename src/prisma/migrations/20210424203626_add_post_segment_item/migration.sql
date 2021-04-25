-- CreateTable
CREATE TABLE "PostSegmentItem" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "content" TEXT NOT NULL,
    "postSegmentId" TEXT NOT NULL,

    PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "PostSegmentItem" ADD FOREIGN KEY ("postSegmentId") REFERENCES "PostSegment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
