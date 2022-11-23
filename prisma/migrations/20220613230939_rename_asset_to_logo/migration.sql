/*
  Warnings:

  - You are about to drop the column `assetId` on the `DonationProvider` table. All the data in the column will be lost.
  - Added the required column `logoId` to the `DonationProvider` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "DonationProvider" DROP COLUMN "assetId",
ADD COLUMN     "logoId" TEXT NOT NULL;
