import { getUserFromRequest } from "@/lib/getUserFromRequest";
import { prisma } from "@/lib/prisma";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const user = await getUserFromRequest(req, res);

    const { roomId } = req.query;

    if (!roomId || typeof roomId !== "string") {
      return res.status(400).json({ error: "Invalid room ID" });
    }

    // Check if room exists and determine access
    const room = await prisma.chatRoom.findUnique({
      where: { id: roomId },
      include: user ? {
        members: {
          where: { userId: user.id }
        }
      } : undefined
    });

    if (!room) {
      return res.status(404).json({ error: "Room not found" });
    }

    // If room is private, check if user is authenticated and is a member
    if (room.isPrivate) {
      if (!user) {
        return res.status(401).json({ error: "Authentication required for private rooms" });
      }
      // Check if user is a member of the private room
      const isMember = await prisma.chatRoomMember.findFirst({
        where: {
          userId: user.id,
          chatRoomId: roomId
        }
      });
      if (!isMember) {
        return res.status(403).json({ error: "Access denied" });
      }
    }

    // For POST requests, authentication is required
    if (req.method === "POST" && !user) {
      return res.status(401).json({ error: "Authentication required to send messages" });
    }

    if (req.method === "GET") {
      try {
        const limit = parseInt(req.query.limit as string) || 50;
        const before = req.query.before as string;


        // Use raw SQL to handle orphaned messages
        const messages = await prisma.$queryRaw`
        SELECT
          cm.id,
          cm.content,
          cm."chatRoomId",
          cm."createdAt",
          cm."editedAt",
          u.id as "userId",
          u.username
        FROM "ChatMessage" cm
        INNER JOIN "User" u ON cm."userId" = u.id
        WHERE cm."chatRoomId" = ${roomId}
        ORDER BY cm."createdAt" DESC
        LIMIT ${limit}
      ` as Array<{
          id: string;
          content: string;
          chatRoomId: string;
          createdAt: Date;
          editedAt: Date | null;
          userId: number;
          username: string;
        }>;

        // Format messages to match expected structure
        const formattedMessages = messages.map(msg => ({
          id: msg.id,
          content: msg.content,
          userId: msg.userId,
          chatRoomId: msg.chatRoomId,
          createdAt: msg.createdAt,
          editedAt: msg.editedAt,
          user: {
            id: msg.userId,
            username: msg.username
          }
        }));

        return res.status(200).json({ messages: formattedMessages.reverse() });
      } catch (error) {
        console.error("Error fetching messages:", error);
        return res.status(500).json({ error: "Internal server error" });
      }
    }

    if (req.method === "POST") {
      try {
        const { content } = req.body;

        if (!content || typeof content !== "string" || content.trim().length === 0) {
          return res.status(400).json({ error: "Message content is required" });
        }

        // At this point, user is guaranteed to be non-null due to check above
        const message = await prisma.chatMessage.create({
          data: {
            content: content.trim(),
            userId: user!.id,
            chatRoomId: roomId,
          },
          include: {
            user: {
              include: {
                avatar: {
                  select: {
                    base64Image: true,
                    avatarId: true,
                    gender: true,
                  },
                },
              },
            },
          },
        });

        return res.status(201).json({ message });
      } catch (error) {
        console.error("Error creating message:", error);
        return res.status(500).json({ error: "Internal server error" });
      }
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (error) {
    console.error("Handler error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
