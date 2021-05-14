/*
  Warnings:

  - You are about to drop the column `category` on the `Post` table. All the data in the column will be lost.
  - Added the required column `postCategoryId` to the `Post` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Post" DROP COLUMN "category",
ADD COLUMN     "postCategoryId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Post" ADD FOREIGN KEY ("postCategoryId") REFERENCES "PostCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;
