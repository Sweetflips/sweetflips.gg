-- Drop unused tables and their foreign keys
-- Tables to remove: Avatar, ChatRoom, ChatRoomMember, ChatMessage, Order, Product, OAuthSession, FortuneWheel, TokenSettings, UserData, StreamSchedule

-- Drop foreign key constraints first
ALTER TABLE "Order" DROP CONSTRAINT IF EXISTS "Order_userId_fkey";
ALTER TABLE "Order" DROP CONSTRAINT IF EXISTS "Order_productId_fkey";
ALTER TABLE "ChatRoomMember" DROP CONSTRAINT IF EXISTS "ChatRoomMember_userId_fkey";
ALTER TABLE "ChatRoomMember" DROP CONSTRAINT IF EXISTS "ChatRoomMember_chatRoomId_fkey";
ALTER TABLE "ChatMessage" DROP CONSTRAINT IF EXISTS "ChatMessage_userId_fkey";
ALTER TABLE "ChatMessage" DROP CONSTRAINT IF EXISTS "ChatMessage_chatRoomId_fkey";
ALTER TABLE "Avatar" DROP CONSTRAINT IF EXISTS "Avatar_userId_fkey";

-- Drop tables (CASCADE will handle any remaining dependencies)
DROP TABLE IF EXISTS "ChatMessage" CASCADE;
DROP TABLE IF EXISTS "ChatRoomMember" CASCADE;
DROP TABLE IF EXISTS "ChatRoom" CASCADE;
DROP TABLE IF EXISTS "Order" CASCADE;
DROP TABLE IF EXISTS "Product" CASCADE;
DROP TABLE IF EXISTS "Avatar" CASCADE;
DROP TABLE IF EXISTS "OAuthSession" CASCADE;
DROP TABLE IF EXISTS "FortuneWheel" CASCADE;
DROP TABLE IF EXISTS "TokenSettings" CASCADE;
DROP TABLE IF EXISTS "UserData" CASCADE;
DROP TABLE IF EXISTS "StreamSchedule" CASCADE;
