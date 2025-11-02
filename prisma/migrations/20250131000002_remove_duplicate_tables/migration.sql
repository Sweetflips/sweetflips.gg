-- Remove duplicate/unused tables
-- Based on database inspection, removing:
-- - Leaderboard (duplicate/old)
-- - LuxdropCache (duplicate/old)
-- - leaderboard (lowercase duplicate)
-- - luxdropcache (lowercase duplicate)

-- Keep only: LeaderboardCache (the correct one we're using)

DROP TABLE IF EXISTS "Leaderboard" CASCADE;
DROP TABLE IF EXISTS "LuxdropCache" CASCADE;
DROP TABLE IF EXISTS "leaderboard" CASCADE;
DROP TABLE IF EXISTS "luxdropcache" CASCADE;

