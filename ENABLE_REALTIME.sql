-- Enable Realtime for Chat Tables in Supabase
-- Run this script in your Supabase SQL Editor

-- Enable Realtime for ChatMessage table
ALTER PUBLICATION supabase_realtime 
ADD TABLE "ChatMessage";

-- Enable Realtime for ChatRoom table
ALTER PUBLICATION supabase_realtime 
ADD TABLE "ChatRoom";

-- Enable Realtime for ChatRoomMember table
ALTER PUBLICATION supabase_realtime 
ADD TABLE "ChatRoomMember";

-- Verify that Realtime is enabled
SELECT 
    schemaname,
    tablename
FROM 
    pg_publication_tables
WHERE 
    pubname = 'supabase_realtime';

-- Note: You may also need to configure RLS (Row Level Security) policies
-- for these tables if you haven't already. Here are basic policies:

-- Enable RLS on tables
ALTER TABLE "ChatMessage" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ChatRoom" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ChatRoomMember" ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read messages from rooms they're members of
CREATE POLICY "Users can view messages in their rooms"
ON "ChatMessage"
FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM "ChatRoomMember"
        WHERE "ChatRoomMember"."chatRoomId" = "ChatMessage"."chatRoomId"
        AND "ChatRoomMember"."userId" = auth.uid()::int
    )
    OR 
    EXISTS (
        SELECT 1 FROM "ChatRoom"
        WHERE "ChatRoom"."id" = "ChatMessage"."chatRoomId"
        AND "ChatRoom"."isPrivate" = false
    )
);

-- Allow authenticated users to send messages to rooms they're members of
CREATE POLICY "Users can send messages to their rooms"
ON "ChatMessage"
FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM "ChatRoomMember"
        WHERE "ChatRoomMember"."chatRoomId" = "ChatMessage"."chatRoomId"
        AND "ChatRoomMember"."userId" = auth.uid()::int
    )
    OR 
    EXISTS (
        SELECT 1 FROM "ChatRoom"
        WHERE "ChatRoom"."id" = "ChatMessage"."chatRoomId"
        AND "ChatRoom"."isPrivate" = false
    )
);

-- Allow users to view public rooms and rooms they're members of
CREATE POLICY "Users can view accessible rooms"
ON "ChatRoom"
FOR SELECT
USING (
    "isPrivate" = false 
    OR 
    EXISTS (
        SELECT 1 FROM "ChatRoomMember"
        WHERE "ChatRoomMember"."chatRoomId" = "ChatRoom"."id"
        AND "ChatRoomMember"."userId" = auth.uid()::int
    )
);

-- Allow users to view room memberships
CREATE POLICY "Users can view room members"
ON "ChatRoomMember"
FOR SELECT
USING (true);

-- Note: After running this script, you should see the tables listed
-- in your Supabase Dashboard under Database > Replication
-- Make sure Realtime is enabled for your project in the dashboard settings