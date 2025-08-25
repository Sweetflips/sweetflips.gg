-- Complete SQL to recreate Avatar table with all fields including avatarLink

-- Drop existing avatar table and all its dependencies
DROP TABLE IF EXISTS "Avatar" CASCADE;

-- Create Avatar table with all Ready Player Me properties
CREATE TABLE "Avatar" (
  "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
  "userId" INTEGER NOT NULL,
  
  -- Core Ready Player Me properties
  "avatarId" TEXT,
  "partner" TEXT,
  
  -- Avatar configuration
  "gender" TEXT,
  "bodyType" TEXT,
  "bodyShape" TEXT,
  
  -- Avatar assets - stores all customization options as JSON
  "assets" JSONB,
  
  -- Visual representations
  "base64Image" TEXT,
  "avatarUrl" TEXT,
  "avatarLink" TEXT, -- Ready Player Me shareable avatar link
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
  CONSTRAINT "Avatar_userId_key" UNIQUE ("userId"),
  CONSTRAINT "Avatar_userId_fkey" FOREIGN KEY ("userId") 
    REFERENCES "User"("id") 
    ON DELETE CASCADE 
    ON UPDATE CASCADE
);

-- Create indexes for better performance
CREATE INDEX "Avatar_userId_idx" ON "Avatar"("userId");
CREATE INDEX "Avatar_avatarId_idx" ON "Avatar"("avatarId");
CREATE INDEX "Avatar_avatarLink_idx" ON "Avatar"("avatarLink");

-- Add comments to describe fields
COMMENT ON COLUMN "Avatar"."avatarId" IS 'Ready Player Me avatar unique identifier';
COMMENT ON COLUMN "Avatar"."avatarLink" IS 'Ready Player Me shareable avatar link (e.g. https://readyplayer.me/avatar/[id])';
COMMENT ON COLUMN "Avatar"."avatarUrl" IS 'Direct URL to the 3D avatar model (.glb file)';
COMMENT ON COLUMN "Avatar"."assets" IS 'JSON object containing all avatar customization assets (hair, clothing, etc.)';

-- Create trigger to automatically update the updatedAt timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW."updatedAt" = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply the trigger to Avatar table
CREATE TRIGGER update_avatar_updated_at 
  BEFORE UPDATE ON "Avatar" 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Grant necessary permissions
GRANT ALL ON "Avatar" TO authenticated;
GRANT ALL ON "Avatar" TO service_role;

-- Optional: Add Row Level Security (RLS) policies
-- Uncomment and adjust based on your security requirements

-- ALTER TABLE "Avatar" ENABLE ROW LEVEL SECURITY;

-- -- Users can read their own avatar
-- CREATE POLICY "Users can view own avatar" ON "Avatar"
--   FOR SELECT USING (auth.uid()::text = (
--     SELECT "auth_user_id" FROM "User" WHERE "id" = "Avatar"."userId"
--   ));

-- -- Users can update their own avatar  
-- CREATE POLICY "Users can update own avatar" ON "Avatar"
--   FOR UPDATE USING (auth.uid()::text = (
--     SELECT "auth_user_id" FROM "User" WHERE "id" = "Avatar"."userId"
--   ));

-- -- Users can insert their own avatar
-- CREATE POLICY "Users can insert own avatar" ON "Avatar"
--   FOR INSERT WITH CHECK (auth.uid()::text = (
--     SELECT "auth_user_id" FROM "User" WHERE "id" = "Avatar"."userId"
--   ));

-- -- Public avatars can be viewed by anyone
-- CREATE POLICY "Public avatars are viewable" ON "Avatar"
--   FOR SELECT USING ("isPublic" = true);

-- Verify the table structure
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'Avatar'
ORDER BY ordinal_position;