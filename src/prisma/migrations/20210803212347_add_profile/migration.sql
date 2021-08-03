-- CreateTable
CREATE TABLE "Profile" (
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "username" TEXT NOT NULL,

    PRIMARY KEY ("userId")
);

-- CreateIndex
CREATE UNIQUE INDEX "Profile.username_unique" ON "Profile"("username");
