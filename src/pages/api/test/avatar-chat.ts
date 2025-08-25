import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Find users with avatars
    const usersWithAvatars = await prisma.user.findMany({
      where: {
        avatar: {
          isNot: null
        }
      },
      include: {
        avatar: {
          select: {
            avatarId: true,
            base64Image: true,
            gender: true,
            avatarUrl: true,
            avatarLink: true
          }
        }
      },
      take: 5
    });

    // Find recent messages with user avatars
    const recentMessages = await prisma.chatMessage.findMany({
      include: {
        user: {
          include: {
            avatar: {
              select: {
                base64Image: true,
                avatarId: true,
                gender: true,
              }
            }
          }
        }
      },
      take: 10,
      orderBy: {
        createdAt: 'desc'
      }
    });

    const stats = {
      totalUsersWithAvatars: usersWithAvatars.length,
      usersWithBase64Image: usersWithAvatars.filter(u => u.avatar?.base64Image).length,
      messagesChecked: recentMessages.length,
      messagesWithAvatar: recentMessages.filter(m => m.user.avatar).length,
      messagesWithBase64Image: recentMessages.filter(m => m.user.avatar?.base64Image).length,
    };

    return res.status(200).json({
      stats,
      sampleUsers: usersWithAvatars.map(u => ({
        username: u.username,
        hasAvatar: !!u.avatar,
        hasBase64Image: !!u.avatar?.base64Image,
        base64ImageLength: u.avatar?.base64Image?.length || 0,
        avatarId: u.avatar?.avatarId,
        gender: u.avatar?.gender
      })),
      sampleMessages: recentMessages.slice(0, 3).map(m => ({
        username: m.user.username,
        hasAvatar: !!m.user.avatar,
        hasBase64Image: !!m.user.avatar?.base64Image,
        avatarId: m.user.avatar?.avatarId
      }))
    });
  } catch (error) {
    console.error("Error testing avatar data:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}