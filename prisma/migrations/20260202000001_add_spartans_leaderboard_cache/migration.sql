-- Create SpartansLeaderboardCache table
CREATE TABLE "SpartansLeaderboardCache" (
    "id" TEXT NOT NULL,
    "cacheKey" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "fetchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SpartansLeaderboardCache_pkey" PRIMARY KEY ("id")
);

-- Create unique index on cacheKey
CREATE UNIQUE INDEX "SpartansLeaderboardCache_cacheKey_key" ON "SpartansLeaderboardCache"("cacheKey");

-- Create index on expiresAt for efficient cache cleanup
CREATE INDEX "SpartansLeaderboardCache_expiresAt_idx" ON "SpartansLeaderboardCache"("expiresAt");
