-- SQL Migration to add avatarLink field to Avatar table

-- Option 1: If you're recreating the entire table (from previous SQL)
-- The avatarLink field is already included in the CREATE TABLE statement

-- Option 2: If you're just adding the avatarLink field to existing table
ALTER TABLE "Avatar" 
ADD COLUMN IF NOT EXISTS "avatarLink" TEXT;

-- Add a comment to describe the field
COMMENT ON COLUMN "Avatar"."avatarLink" IS 'Ready Player Me shareable avatar link (e.g. https://readyplayer.me/avatar/[id])';

-- Optionally create an index on avatarLink for faster lookups
CREATE INDEX IF NOT EXISTS "Avatar_avatarLink_idx" ON "Avatar"("avatarLink");

-- Verify the column was added
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'Avatar' 
  AND column_name = 'avatarLink';