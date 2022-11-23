-- CreateTable
CREATE TABLE "_PostCommentUpvotes" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_PostCommentDownvotes" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_PostCommentUpvotes_AB_unique" ON "_PostCommentUpvotes"("A", "B");

-- CreateIndex
CREATE INDEX "_PostCommentUpvotes_B_index" ON "_PostCommentUpvotes"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_PostCommentDownvotes_AB_unique" ON "_PostCommentDownvotes"("A", "B");

-- CreateIndex
CREATE INDEX "_PostCommentDownvotes_B_index" ON "_PostCommentDownvotes"("B");

-- AddForeignKey
ALTER TABLE "_PostCommentUpvotes" ADD FOREIGN KEY ("A") REFERENCES "PostComment"("commentId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PostCommentUpvotes" ADD FOREIGN KEY ("B") REFERENCES "User"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PostCommentDownvotes" ADD FOREIGN KEY ("A") REFERENCES "PostComment"("commentId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PostCommentDownvotes" ADD FOREIGN KEY ("B") REFERENCES "User"("userId") ON DELETE CASCADE ON UPDATE CASCADE;
