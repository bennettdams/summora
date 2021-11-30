/*
  Warnings:

  - You are about to drop the column `views` on the `Post` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Post" DROP COLUMN "views",
ADD COLUMN     "noOfViews" INTEGER NOT NULL DEFAULT 0;
