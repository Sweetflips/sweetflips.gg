import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/getUserFromRequest";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = await getUserFromRequest(req, res);
  
  if (!user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { roomId } = req.query;

  if (!roomId || typeof roomId !== "string") {
    return res.status(400).json({ error: "Invalid room ID" });
  }

  // Check if user is a member of the room
  const membership = await prisma.chatRoomMember.findUnique({
    where: {
      userId_chatRoomId: {
        userId: user.id,
        chatRoomId: roomId,
      },
    },
  });

  // If room is private and user is not a member, check if it's public
  if (!membership) {
    const room = await prisma.chatRoom.findUnique({
      where: { id: roomId },
    });

    if (!room || room.isPrivate) {
      return res.status(403).json({ error: "Access denied" });
    }

    // Auto-join public room
    await prisma.chatRoomMember.create({
      data: {
        userId: user.id,
        chatRoomId: roomId,
      },
    });
  }

  if (req.method === "GET") {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const before = req.query.before as string;

      const messages = await prisma.chatMessage.findMany({
        where: {
          chatRoomId: roomId,
          ...(before && { createdAt: { lt: new Date(before) } }),
        },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              avatar: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: limit,
      });

      return res.status(200).json({ messages: messages.reverse() });
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

      const message = await prisma.chatMessage.create({
        data: {
          content: content.trim(),
          userId: user.id,
          chatRoomId: roomId,
        },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              avatar: true,
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
}