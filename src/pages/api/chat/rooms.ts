import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/getUserFromRequest";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = await getUserFromRequest(req);
  
  if (!user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (req.method === "GET") {
    try {
      const rooms = await prisma.chatRoom.findMany({
        where: {
          OR: [
            { isPrivate: false },
            {
              members: {
                some: {
                  userId: user.id,
                },
              },
            },
          ],
        },
        include: {
          _count: {
            select: { members: true },
          },
          messages: {
            orderBy: { createdAt: "desc" },
            take: 1,
            select: {
              content: true,
              createdAt: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      const formattedRooms = rooms.map((room) => ({
        id: room.id,
        name: room.name,
        isPrivate: room.isPrivate,
        memberCount: room._count.members,
        lastMessage: room.messages[0] || null,
      }));

      return res.status(200).json({ rooms: formattedRooms });
    } catch (error) {
      console.error("Error fetching rooms:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  if (req.method === "POST") {
    try {
      const { name, isPrivate = false } = req.body;

      if (!name || typeof name !== "string" || name.trim().length === 0) {
        return res.status(400).json({ error: "Room name is required" });
      }

      const room = await prisma.chatRoom.create({
        data: {
          name: name.trim(),
          isPrivate,
          members: {
            create: {
              userId: user.id,
            },
          },
        },
      });

      return res.status(201).json({ room });
    } catch (error) {
      console.error("Error creating room:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}