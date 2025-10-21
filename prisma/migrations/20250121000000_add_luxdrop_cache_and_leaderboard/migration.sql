-- CreateTable
CREATE TABLE "LuxdropCache" (
    "id" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "period" TEXT NOT NULL,
    "startDate" TEXT NOT NULL,
    "endDate" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LuxdropCache_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Leaderboard" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "wagered" DOUBLE PRECISION NOT NULL,
    "reward" DOUBLE PRECISION NOT NULL,
    "rank" INTEGER NOT NULL,
    "period" TEXT NOT NULL,
    "startDate" TEXT NOT NULL,
    "endDate" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Leaderboard_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "LuxdropCache_period_startDate_endDate_key" ON "LuxdropCache"("period", "startDate", "endDate");

-- CreateIndex
CREATE INDEX "LuxdropCache_createdAt_idx" ON "LuxdropCache"("createdAt");

-- CreateIndex
CREATE INDEX "Leaderboard_period_startDate_endDate_idx" ON "Leaderboard"("period", "startDate", "endDate");

-- CreateIndex
CREATE INDEX "Leaderboard_rank_idx" ON "Leaderboard"("rank");
