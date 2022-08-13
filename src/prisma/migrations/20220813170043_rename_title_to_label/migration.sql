/*
 Custom migration to rename.
*/
-- AlterTable
ALTER TABLE "PostCategory"
RENAME COLUMN "title" TO "label";

-- AlterTable
ALTER TABLE "PostTag"
RENAME COLUMN "title" TO "label";
