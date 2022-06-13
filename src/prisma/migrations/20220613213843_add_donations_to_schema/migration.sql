-- CreateTable
CREATE TABLE "DonationLink" (
    "donationLinkId" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "donationProviderId" TEXT NOT NULL,

    CONSTRAINT "DonationLink_pkey" PRIMARY KEY ("donationLinkId")
);

-- CreateTable
CREATE TABLE "DonationProvider" (
    "donationProviderId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "assetId" TEXT NOT NULL,

    CONSTRAINT "DonationProvider_pkey" PRIMARY KEY ("donationProviderId")
);

-- AddForeignKey
ALTER TABLE "DonationLink" ADD CONSTRAINT "DonationLink_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DonationLink" ADD CONSTRAINT "DonationLink_donationProviderId_fkey" FOREIGN KEY ("donationProviderId") REFERENCES "DonationProvider"("donationProviderId") ON DELETE RESTRICT ON UPDATE CASCADE;
