import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth-utils';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'PUT' && req.method !== 'PATCH') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId, authUserId, avatarProperties } = req.body;

    if (!userId && !authUserId) {
      return res.status(400).json({ error: 'Missing user identifier (userId or authUserId)' });
    }

    // Verify the user has permission (either admin or the user themselves)
    const requestingUser = await getUserFromRequest(req);
    if (!requestingUser) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Check permission based on user type
    const hasPermission = 
      (userId && requestingUser.id === userId) ||
      (authUserId && requestingUser.auth_user_id === authUserId) ||
      requestingUser.role === 'admin';
    
    if (!hasPermission) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    // Check if avatar exists
    const whereClause = userId 
      ? { userId } 
      : { auth_user_id: authUserId };
      
    const existingAvatar = await prisma.avatar.findUnique({
      where: whereClause
    });

    if (!existingAvatar) {
      return res.status(404).json({ error: 'Avatar not found for this user' });
    }

    // Build update object dynamically
    const updateData: any = {
      updatedAt: new Date()
    };

    // Handle both Pascal and camel case property names
    if (avatarProperties.Id !== undefined || avatarProperties.id !== undefined) {
      updateData.avatarId = avatarProperties.Id || avatarProperties.id;
    }
    if (avatarProperties.Partner !== undefined || avatarProperties.partner !== undefined) {
      updateData.partner = avatarProperties.Partner || avatarProperties.partner;
    }
    if (avatarProperties.Gender !== undefined || avatarProperties.gender !== undefined) {
      updateData.gender = avatarProperties.Gender || avatarProperties.gender;
    }
    if (avatarProperties.BodyType !== undefined || avatarProperties.bodyType !== undefined) {
      updateData.bodyType = avatarProperties.BodyType || avatarProperties.bodyType;
    }
    if (avatarProperties.BodyShape !== undefined || avatarProperties.bodyShape !== undefined) {
      updateData.bodyShape = avatarProperties.BodyShape || avatarProperties.bodyShape;
    }
    if (avatarProperties.Assets !== undefined || avatarProperties.assets !== undefined) {
      updateData.assets = avatarProperties.Assets || avatarProperties.assets;
    }
    if (avatarProperties.Base64Image !== undefined || avatarProperties.base64Image !== undefined) {
      updateData.base64Image = avatarProperties.Base64Image || avatarProperties.base64Image;
    }
    if (avatarProperties.isDraft !== undefined) {
      updateData.isDraft = avatarProperties.isDraft;
    }
    if (avatarProperties.avatarUrl !== undefined) {
      updateData.avatarUrl = avatarProperties.avatarUrl;
    }
    if (avatarProperties.avatarLink !== undefined) {
      updateData.avatarLink = avatarProperties.avatarLink;
    }
    if (avatarProperties.thumbnailUrl !== undefined) {
      updateData.thumbnailUrl = avatarProperties.thumbnailUrl;
    }
    if (avatarProperties.renderPose !== undefined) {
      updateData.renderPose = avatarProperties.renderPose;
    }
    if (avatarProperties.expression !== undefined) {
      updateData.expression = avatarProperties.expression;
    }
    if (avatarProperties.isPublic !== undefined) {
      updateData.isPublic = avatarProperties.isPublic;
    }
    if (avatarProperties.metadata !== undefined) {
      updateData.metadata = avatarProperties.metadata;
    }

    // Update avatar
    const avatar = await prisma.avatar.update({
      where: whereClause,
      data: updateData
    });

    return res.status(200).json({ 
      success: true, 
      message: 'Avatar updated successfully',
      avatar 
    });
  } catch (error) {
    console.error('Error updating avatar:', error);
    return res.status(500).json({ error: 'Failed to update avatar' });
  }
}

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb', // Increase size limit for base64 images
    },
  },
};