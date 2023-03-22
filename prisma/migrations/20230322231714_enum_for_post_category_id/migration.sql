/*
  Warnings:

  - The primary key for the `PostCategory` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - Changed the type of `postCategoryId` on the `Post` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `id` on the `PostCategory` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "PostCategoryId" AS ENUM ('books', 'movies', 'series', 'music', 'gaming', 'pcelectronics', 'household', 'animals', 'nature', 'beauty', 'vehicles', 'fooddrinks', 'education', 'babys', 'fashion', 'sports', 'travel', 'programming');

-- DropForeignKey
ALTER TABLE "Post" DROP CONSTRAINT "Post_postCategoryId_fkey";

-- AlterTable
ALTER TABLE "Post" DROP COLUMN "postCategoryId",
ADD COLUMN     "postCategoryId" "PostCategoryId" NOT NULL;

-- AlterTable
ALTER TABLE "PostCategory" DROP CONSTRAINT "PostCategory_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" "PostCategoryId" NOT NULL,
ADD CONSTRAINT "PostCategory_pkey" PRIMARY KEY ("id");

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_postCategoryId_fkey" FOREIGN KEY ("postCategoryId") REFERENCES "PostCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
