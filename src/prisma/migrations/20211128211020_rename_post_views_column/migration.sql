/*
  Warnings:

  - You are about to drop the column `views` on the `Post` table. All the data in the column will be lost.
  - You are about to drop the `_PostLikes` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_PostLikes" DROP CONSTRAINT "_PostLikes_A_fkey";

-- DropForeignKey
ALTER TABLE "_PostLikes" DROP CONSTRAINT "_PostLikes_B_fkey";

-- AlterTable
ALTER TABLE "Post" DROP COLUMN "views",
ADD COLUMN     "noOfViews" INTEGER NOT NULL DEFAULT 0;

-- DropTable
DROP TABLE "_PostLikes";
