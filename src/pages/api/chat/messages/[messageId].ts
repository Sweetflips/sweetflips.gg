import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/getUserFromRequest";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = await getUserFromRequest(req, res);
  
  if (!user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { messageId } = req.query;

  if (!messageId || typeof messageId !== "string") {
    return res.status(400).json({ error: "Invalid message ID" });
  }

  if (req.method === "GET") {
    try {
      const message = await prisma.chatMessage.findUnique({
        where: { id: messageId },
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

      if (!message) {
        return res.status(404).json({ error: "Message not found" });
      }

      // Check if user has access to this message's room
      const hasAccess = await prisma.chatRoomMember.findUnique({
        where: {
          userId_chatRoomId: {
            userId: user.id,
            chatRoomId: message.chatRoomId,
          },
        },
      });

      // If not a member, check if room is public
      if (!hasAccess) {
        const room = await prisma.chatRoom.findUnique({
          where: { id: message.chatRoomId },
        });

        if (!room || room.isPrivate) {
          return res.status(403).json({ error: "Access denied" });
        }
      }

      return res.status(200).json({ message });
    } catch (error) {
      console.error("Error fetching message:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}