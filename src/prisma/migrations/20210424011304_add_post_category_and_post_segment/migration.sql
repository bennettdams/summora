/*
  Warnings:

  - Added the required column `category` to the `Post` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title` to the `PostSegment` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "category" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "PostSegment" ADD COLUMN     "title" TEXT NOT NULL,
ADD COLUMN     "subtitle" TEXT;
