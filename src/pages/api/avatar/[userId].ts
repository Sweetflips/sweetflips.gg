import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId } = req.query;

    if (!userId || typeof userId !== 'string') {
      return res.status(400).json({ error: 'Invalid userId' });
    }

    const userIdNum = parseInt(userId, 10);
    if (isNaN(userIdNum)) {
      return res.status(400).json({ error: 'userId must be a number' });
    }

    // Get avatar properties
    const avatar = await prisma.avatar.findUnique({
      where: { userId: userIdNum },
      select: {
        id: true,
        avatarId: true,
        partner: true,
        gender: true,
        bodyType: true,
        bodyShape: true,
        assets: true,
        base64Image: true,
        isDraft: true,
        avatarUrl: true,
        avatarLink: true,
        thumbnailUrl: true,
        renderPose: true,
        expression: true,
        isPublic: true,
        metadata: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!avatar) {
      return res.status(404).json({ error: 'Avatar not found for this user' });
    }

    // Format the response to match Unity AvatarProperties structure
    const avatarProperties = {
      Id: avatar.avatarId,
      Partner: avatar.partner,
      Gender: avatar.gender,
      BodyType: avatar.bodyType,
      BodyShape: avatar.bodyShape,
      Assets: avatar.assets,
      Base64Image: avatar.base64Image,
      isDraft: avatar.isDraft,
      avatarUrl: avatar.avatarUrl,
      avatarLink: avatar.avatarLink,
      thumbnailUrl: avatar.thumbnailUrl,
      renderPose: avatar.renderPose,
      expression: avatar.expression,
      isPublic: avatar.isPublic,
      metadata: avatar.metadata,
      createdAt: avatar.createdAt,
      updatedAt: avatar.updatedAt
    };

    return res.status(200).json({ 
      success: true,
      avatar: avatarProperties
    });
  } catch (error) {
    console.error('Error retrieving avatar:', error);
    return res.status(500).json({ error: 'Failed to retrieve avatar' });
  }
}