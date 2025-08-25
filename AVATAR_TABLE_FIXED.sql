-- Fixed Avatar table SQL with proper UUID type for auth_user_id
-- This version corrects the type mismatch with auth.users table

-- Drop existing avatar table if exists
DROP TABLE IF EXISTS "Avatar" CASCADE;

-- Create Avatar table with correct data types
CREATE TABLE "Avatar" (
  "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
  
  -- User linking fields with correct types
  "auth_user_id" UUID UNIQUE,     -- Links to auth.users(id) - UUID type
  "userId" INTEGER UNIQUE,         -- Links to public.User(id) - INTEGER type
  
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
  
  -- Foreign key to public.User table
  CONSTRAINT "Avatar_userId_fkey" FOREIGN KEY ("userId") 
    REFERENCES "User"("id") 
    ON DELETE CASCADE 
    ON UPDATE CASCADE,
    
  -- Foreign key to auth.users table (UUID type)
  CONSTRAINT "Avatar_auth_user_id_fkey" FOREIGN KEY ("auth_user_id")
    REFERENCES auth.users(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
    
  -- Ensure at least one user reference exists
  CONSTRAINT "Avatar_must_have_user" CHECK (
    "auth_user_id" IS NOT NULL OR "userId" IS NOT NULL
  )
);

-- Create indexes for better performance
CREATE INDEX "Avatar_userId_idx" ON "Avatar"("userId");
CREATE INDEX "Avatar_auth_user_id_idx" ON "Avatar"("auth_user_id");
CREATE INDEX "Avatar_avatarId_idx" ON "Avatar"("avatarId");
CREATE INDEX "Avatar_avatarLink_idx" ON "Avatar"("avatarLink");

-- Create trigger to automatically update the updatedAt timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW."updatedAt" = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply the trigger to Avatar table
DROP TRIGGER IF EXISTS update_avatar_updated_at ON "Avatar";
CREATE TRIGGER update_avatar_updated_at 
  BEFORE UPDATE ON "Avatar" 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Grant necessary permissions
GRANT ALL ON "Avatar" TO authenticated;
GRANT ALL ON "Avatar" TO service_role;

-- Enable Row Level Security
ALTER TABLE "Avatar" ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Avatar table

-- Policy: Users can view their own avatar (via auth.users)
CREATE POLICY "Users can view own avatar via auth" ON "Avatar"
  FOR SELECT USING (
    auth.uid() = "auth_user_id"
  );

-- Policy: Users can view their own avatar (via public.User)
CREATE POLICY "Users can view own avatar via public user" ON "Avatar"
  FOR SELECT USING (
    auth.uid() = (
      SELECT "auth_user_id" FROM "User" WHERE "id" = "Avatar"."userId"
    )::uuid
  );

-- Policy: Public avatars can be viewed by anyone
CREATE POLICY "Public avatars are viewable" ON "Avatar"
  FOR SELECT USING ("isPublic" = true);

-- Policy: Users can insert their own avatar (via auth.users)
CREATE POLICY "Users can insert own avatar via auth" ON "Avatar"
  FOR INSERT WITH CHECK (
    auth.uid() = "auth_user_id"
  );

-- Policy: Users can insert their own avatar (via public.User)
CREATE POLICY "Users can insert own avatar via public user" ON "Avatar"
  FOR INSERT WITH CHECK (
    auth.uid() = (
      SELECT "auth_user_id" FROM "User" WHERE "id" = "Avatar"."userId"
    )::uuid
  );

-- Policy: Users can update their own avatar (via auth.users)
CREATE POLICY "Users can update own avatar via auth" ON "Avatar"
  FOR UPDATE USING (
    auth.uid() = "auth_user_id"
  );

-- Policy: Users can update their own avatar (via public.User)
CREATE POLICY "Users can update own avatar via public user" ON "Avatar"
  FOR UPDATE USING (
    auth.uid() = (
      SELECT "auth_user_id" FROM "User" WHERE "id" = "Avatar"."userId"
    )::uuid
  );

-- Policy: Users can delete their own avatar (via auth.users)
CREATE POLICY "Users can delete own avatar via auth" ON "Avatar"
  FOR DELETE USING (
    auth.uid() = "auth_user_id"
  );

-- Policy: Users can delete their own avatar (via public.User)
CREATE POLICY "Users can delete own avatar via public user" ON "Avatar"
  FOR DELETE USING (
    auth.uid() = (
      SELECT "auth_user_id" FROM "User" WHERE "id" = "Avatar"."userId"
    )::uuid
  );

-- Create helper view to easily get avatar with user info
CREATE OR REPLACE VIEW "AvatarWithUser" AS
SELECT 
  a.*,
  COALESCE(u.username, au.email) as username,
  COALESCE(u.email, au.email) as email,
  u."kickId" as kick_id,
  CASE 
    WHEN a."auth_user_id" IS NOT NULL THEN 'auth'
    WHEN a."userId" IS NOT NULL THEN 'public'
  END as user_type
FROM "Avatar" a
LEFT JOIN "User" u ON a."userId" = u.id
LEFT JOIN auth.users au ON a."auth_user_id" = au.id;

-- Grant permissions on the view
GRANT SELECT ON "AvatarWithUser" TO authenticated;
GRANT SELECT ON "AvatarWithUser" TO service_role;

-- Verify the table structure
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'Avatar'
ORDER BY ordinal_position;