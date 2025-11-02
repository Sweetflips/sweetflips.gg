-- Create separate tables for Razed and Luxdrop leaderboards
-- Remove old LeaderboardCache table and replace with two separate tables

-- Create RazedLeaderboardCache table
CREATE TABLE "RazedLeaderboardCache" (
    "id" TEXT NOT NULL,
    "cacheKey" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "fetchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RazedLeaderboardCache_pkey" PRIMARY KEY ("id")
);

-- Create LuxdropLeaderboardCache table
CREATE TABLE "LuxdropLeaderboardCache" (
    "id" TEXT NOT NULL,
    "cacheKey" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "period" JSONB,
    "etag" TEXT,
    "fetchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LuxdropLeaderboardCache_pkey" PRIMARY KEY ("id")
);

-- Create indexes
CREATE UNIQUE INDEX "RazedLeaderboardCache_cacheKey_key" ON "RazedLeaderboardCache"("cacheKey");
CREATE INDEX "RazedLeaderboardCache_expiresAt_idx" ON "RazedLeaderboardCache"("expiresAt");

CREATE UNIQUE INDEX "LuxdropLeaderboardCache_cacheKey_key" ON "LuxdropLeaderboardCache"("cacheKey");
CREATE INDEX "LuxdropLeaderboardCache_expiresAt_idx" ON "LuxdropLeaderboardCache"("expiresAt");

-- Migrate existing data from LeaderboardCache to new tables
INSERT INTO "RazedLeaderboardCache" ("id", "cacheKey", "data", "fetchedAt", "expiresAt", "createdAt", "updatedAt")
SELECT "id", "cacheKey", "data", "fetchedAt", "expiresAt", "createdAt", "updatedAt"
FROM "LeaderboardCache"
WHERE "source" = 'razed'
ON CONFLICT DO NOTHING;

INSERT INTO "LuxdropLeaderboardCache" ("id", "cacheKey", "data", "period", "etag", "fetchedAt", "expiresAt", "createdAt", "updatedAt")
SELECT "id", "cacheKey", "data", "period", "etag", "fetchedAt", "expiresAt", "createdAt", "updatedAt"
FROM "LeaderboardCache"
WHERE "source" = 'luxdrop'
ON CONFLICT DO NOTHING;

-- Drop old LeaderboardCache table
DROP TABLE IF EXISTS "LeaderboardCache" CASCADE;

