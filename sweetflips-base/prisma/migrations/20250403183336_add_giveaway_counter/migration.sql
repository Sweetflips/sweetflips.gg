-- CreateTable
CREATE TABLE "GiveawayCounter" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "amount" DOUBLE PRECISION NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GiveawayCounter_pkey" PRIMARY KEY ("id")
);
