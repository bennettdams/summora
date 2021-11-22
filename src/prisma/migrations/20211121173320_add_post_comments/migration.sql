-- CreateTable
CREATE TABLE "PostComment" (
    "commentId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "postId" TEXT NOT NULL,
    "commentParentId" TEXT,

    CONSTRAINT "PostComment_pkey" PRIMARY KEY ("commentId")
);

-- AddForeignKey
ALTER TABLE "PostComment" ADD CONSTRAINT "PostComment_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostComment" ADD CONSTRAINT "PostComment_commentParentId_fkey" FOREIGN KEY ("commentParentId") REFERENCES "PostComment"("commentId") ON DELETE SET NULL ON UPDATE CASCADE;
