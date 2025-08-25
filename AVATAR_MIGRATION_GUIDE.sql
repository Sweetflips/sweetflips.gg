-- Avatar Table Migration Guide
-- This guide helps you migrate from the old Avatar table to the new one with proper user linking

-- STEP 1: Backup existing avatar data (if any)
CREATE TABLE IF NOT EXISTS "Avatar_backup" AS 
SELECT * FROM "Avatar" WHERE EXISTS (SELECT 1 FROM "Avatar" LIMIT 1);

-- STEP 2: Drop the old Avatar table
DROP TABLE IF EXISTS "Avatar" CASCADE;

-- STEP 3: Create the new Avatar table with proper user linking
CREATE TABLE "Avatar" (
  "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
  
  -- User linking fields
  "auth_user_id" TEXT UNIQUE,
  "userId" INTEGER UNIQUE,
  
  -- Core Ready Player Me properties
  "avatarId" TEXT,
  "partner" TEXT,
  
  -- Avatar configuration
  "gender" TEXT,
  "bodyType" TEXT,
  "bodyShape" TEXT,
  
  -- Avatar assets
  "assets" JSONB,
  
  -- Visual representations
  "base64Image" TEXT,
  "avatarUrl" TEXT,
  "avatarLink" TEXT,
  "thumbnailUrl" TEXT,
  
  -- Render settings
  "renderPose" TEXT,
  "expression" TEXT,
  
  -- Status
  "isDraft" BOOLEAN NOT NULL DEFAULT false,
  "isPublic" BOOLEAN NOT NULL DEFAULT true,
  
  -- Metadata
  "metadata" JSONB,
  
  -- Timestamps
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  -- Constraints
  CONSTRAINT "Avatar_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "Avatar_userId_fkey" FOREIGN KEY ("userId") 
    REFERENCES "User"("id") 
    ON DELETE CASCADE 
    ON UPDATE CASCADE,
  CONSTRAINT "Avatar_auth_user_id_fkey" FOREIGN KEY ("auth_user_id")
    REFERENCES auth.users(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT "Avatar_must_have_user" CHECK (
    "auth_user_id" IS NOT NULL OR "userId" IS NOT NULL
  )
);

-- STEP 4: Create indexes
CREATE INDEX "Avatar_userId_idx" ON "Avatar"("userId");
CREATE INDEX "Avatar_auth_user_id_idx" ON "Avatar"("auth_user_id");
CREATE INDEX "Avatar_avatarId_idx" ON "Avatar"("avatarId");
CREATE INDEX "Avatar_avatarLink_idx" ON "Avatar"("avatarLink");

-- STEP 5: Migrate data from backup (if exists)
-- This will link avatars to both userId and auth_user_id where possible
INSERT INTO "Avatar" (
  "id",
  "userId",
  "auth_user_id",
  "avatarId",
  "partner",
  "gender",
  "bodyType",
  "bodyShape",
  "assets",
  "base64Image",
  "avatarUrl",
  "avatarLink",
  "thumbnailUrl",
  "renderPose",
  "expression",
  "isDraft",
  "isPublic",
  "metadata",
  "createdAt",
  "updatedAt"
)
SELECT 
  ab."id",
  ab."userId",
  u."auth_user_id", -- Link to auth.users via User table
  ab."avatarId",
  ab."partner",
  ab."gender",
  ab."bodyType",
  ab."bodyShape",
  ab."assets",
  ab."base64Image",
  ab."avatarUrl",
  ab."avatarLink",
  ab."thumbnailUrl",
  ab."renderPose",
  ab."expression",
  COALESCE(ab."isDraft", false),
  COALESCE(ab."isPublic", true),
  ab."metadata",
  COALESCE(ab."createdAt", CURRENT_TIMESTAMP),
  COALESCE(ab."updatedAt", CURRENT_TIMESTAMP)
FROM "Avatar_backup" ab
LEFT JOIN "User" u ON ab."userId" = u."id"
WHERE EXISTS (SELECT 1 FROM "Avatar_backup" LIMIT 1);

-- STEP 6: Create trigger for updatedAt
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW."updatedAt" = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_avatar_updated_at 
  BEFORE UPDATE ON "Avatar" 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- STEP 7: Set up permissions
GRANT ALL ON "Avatar" TO authenticated;
GRANT ALL ON "Avatar" TO service_role;

-- STEP 8: Enable and configure Row Level Security
ALTER TABLE "Avatar" ENABLE ROW LEVEL SECURITY;

-- Users can view their own avatar (via auth.users)
CREATE POLICY "Users can view own avatar via auth" ON "Avatar"
  FOR SELECT USING (auth.uid() = "auth_user_id");

-- Users can view their own avatar (via public.User)
CREATE POLICY "Users can view own avatar via public user" ON "Avatar"
  FOR SELECT USING (
    auth.uid()::text = (
      SELECT "auth_user_id" FROM "User" WHERE "id" = "Avatar"."userId"
    )
  );

-- Public avatars can be viewed by anyone
CREATE POLICY "Public avatars are viewable" ON "Avatar"
  FOR SELECT USING ("isPublic" = true);

-- Users can insert their own avatar
CREATE POLICY "Users can insert own avatar via auth" ON "Avatar"
  FOR INSERT WITH CHECK (auth.uid() = "auth_user_id");

CREATE POLICY "Users can insert own avatar via public user" ON "Avatar"
  FOR INSERT WITH CHECK (
    auth.uid()::text = (
      SELECT "auth_user_id" FROM "User" WHERE "id" = "Avatar"."userId"
    )
  );

-- Users can update their own avatar
CREATE POLICY "Users can update own avatar via auth" ON "Avatar"
  FOR UPDATE USING (auth.uid() = "auth_user_id");

CREATE POLICY "Users can update own avatar via public user" ON "Avatar"
  FOR UPDATE USING (
    auth.uid()::text = (
      SELECT "auth_user_id" FROM "User" WHERE "id" = "Avatar"."userId"
    )
  );

-- Users can delete their own avatar
CREATE POLICY "Users can delete own avatar via auth" ON "Avatar"
  FOR DELETE USING (auth.uid() = "auth_user_id");

CREATE POLICY "Users can delete own avatar via public user" ON "Avatar"
  FOR DELETE USING (
    auth.uid()::text = (
      SELECT "auth_user_id" FROM "User" WHERE "id" = "Avatar"."userId"
    )
  );

-- STEP 9: Verify migration
SELECT 
  COUNT(*) as total_avatars,
  COUNT("userId") as with_user_id,
  COUNT("auth_user_id") as with_auth_user_id,
  COUNT(*) FILTER (WHERE "userId" IS NOT NULL AND "auth_user_id" IS NOT NULL) as with_both
FROM "Avatar";

-- STEP 10: Clean up backup table (only after verifying migration is successful)
-- DROP TABLE IF EXISTS "Avatar_backup";

-- Helper queries to check avatar linking:

-- Find avatars by email (works for both auth types)
-- SELECT a.*, u.email 
-- FROM "Avatar" a
-- LEFT JOIN "User" u ON a."userId" = u.id
-- LEFT JOIN auth.users au ON a."auth_user_id" = au.id
-- WHERE u.email = 'user@example.com' OR au.email = 'user@example.com';

-- Find users without avatars
-- SELECT u.id, u.email, u.auth_user_id
-- FROM "User" u
-- LEFT JOIN "Avatar" a ON u.id = a."userId" OR u.auth_user_id = a."auth_user_id"
-- WHERE a.id IS NULL;