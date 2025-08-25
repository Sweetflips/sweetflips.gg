import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { userId } = req.query;
  
  if (!userId) {
    return res.status(400).json({ error: "userId required" });
  }
  
  try {
    const userIdNum = parseInt(userId as string);
    
    // Check what the avatar API returns
    const avatarResponse = await fetch(`${req.headers.host?.includes('localhost') ? 'http' : 'https'}://${req.headers.host}/api/avatar/${userIdNum}`);
    const avatarData = await avatarResponse.json();
    
    // Also check database directly
    const dbAvatar = await prisma.avatar.findUnique({
      where: { userId: userIdNum },
      select: {
        id: true,
        base64Image: true,
        avatarId: true,
      }
    });
    
    return res.status(200).json({
      apiResponse: avatarData,
      databaseAvatar: {
        exists: !!dbAvatar,
        hasBase64Image: !!dbAvatar?.base64Image,
        base64ImageLength: dbAvatar?.base64Image?.length || 0,
        avatarId: dbAvatar?.avatarId
      },
      checks: {
        hasAvatar: !!avatarData.avatar,
        hasBase64ImageCapital: !!avatarData.avatar?.Base64Image,
        hasBase64ImageLower: !!avatarData.avatar?.base64Image,
      }
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return res.status(500).json({ error: errorMessage });
  }
}