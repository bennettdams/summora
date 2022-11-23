/*
  Warnings:

  - You are about to drop the column `downvotes` on the `PostComment` table. All the data in the column will be lost.
  - You are about to drop the column `upvotes` on the `PostComment` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "PostComment" DROP COLUMN "downvotes",
DROP COLUMN "upvotes";
