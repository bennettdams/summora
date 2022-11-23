/*
  Warnings:

  - The primary key for the `DonationProvider` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - Changed the type of `donationProviderId` on the `DonationLink` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `donationProviderId` on the `DonationProvider` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "DonationProviderId" AS ENUM ('PAYPAL', 'BITCOIN');

-- DropForeignKey
ALTER TABLE "DonationLink" DROP CONSTRAINT "DonationLink_donationProviderId_fkey";

-- AlterTable
ALTER TABLE "DonationLink" DROP COLUMN "donationProviderId",
ADD COLUMN     "donationProviderId" "DonationProviderId" NOT NULL;

-- AlterTable
ALTER TABLE "DonationProvider" DROP CONSTRAINT "DonationProvider_pkey",
DROP COLUMN "donationProviderId",
ADD COLUMN     "donationProviderId" "DonationProviderId" NOT NULL,
ADD CONSTRAINT "DonationProvider_pkey" PRIMARY KEY ("donationProviderId");

-- AddForeignKey
ALTER TABLE "DonationLink" ADD CONSTRAINT "DonationLink_donationProviderId_fkey" FOREIGN KEY ("donationProviderId") REFERENCES "DonationProvider"("donationProviderId") ON DELETE RESTRICT ON UPDATE CASCADE;
