-- CreateTable
CREATE TABLE "LeaderboardCache" (
    "id" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "cacheKey" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "period" JSONB,
    "etag" TEXT,
    "fetchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LeaderboardCache_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "LeaderboardCache_source_cacheKey_key" ON "LeaderboardCache"("source", "cacheKey");

-- CreateIndex
CREATE INDEX "LeaderboardCache_source_idx" ON "LeaderboardCache"("source");

-- CreateIndex
CREATE INDEX "LeaderboardCache_expiresAt_idx" ON "LeaderboardCache"("expiresAt");
