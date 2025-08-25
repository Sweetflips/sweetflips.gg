import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth-utils';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId, authUserId, avatarProperties } = req.body;

    if ((!userId && !authUserId) || !avatarProperties) {
      return res.status(400).json({ error: 'Missing user identifier (userId or authUserId) or avatarProperties' });
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

    // Process assets to ensure proper format
    const processedAssets = avatarProperties.Assets || avatarProperties.assets;
    
    // Determine which identifier to use for upsert
    const whereClause = userId 
      ? { userId } 
      : { auth_user_id: authUserId };
    
    // Create or update avatar
    const avatar = await prisma.avatar.upsert({
      where: whereClause,
      update: {
        avatarId: avatarProperties.Id || avatarProperties.id,
        partner: avatarProperties.Partner || avatarProperties.partner,
        gender: avatarProperties.Gender || avatarProperties.gender,
        bodyType: avatarProperties.BodyType || avatarProperties.bodyType,
        bodyShape: avatarProperties.BodyShape || avatarProperties.bodyShape,
        assets: processedAssets,
        base64Image: avatarProperties.Base64Image || avatarProperties.base64Image,
        isDraft: avatarProperties.isDraft ?? false,
        avatarUrl: avatarProperties.avatarUrl,
        avatarLink: avatarProperties.avatarLink,
        thumbnailUrl: avatarProperties.thumbnailUrl,
        renderPose: avatarProperties.renderPose,
        expression: avatarProperties.expression,
        isPublic: avatarProperties.isPublic ?? true,
        metadata: avatarProperties.metadata,
        updatedAt: new Date()
      },
      create: {
        userId: userId || null,
        auth_user_id: authUserId || null,
        avatarId: avatarProperties.Id || avatarProperties.id,
        partner: avatarProperties.Partner || avatarProperties.partner,
        gender: avatarProperties.Gender || avatarProperties.gender,
        bodyType: avatarProperties.BodyType || avatarProperties.bodyType,
        bodyShape: avatarProperties.BodyShape || avatarProperties.bodyShape,
        assets: processedAssets,
        base64Image: avatarProperties.Base64Image || avatarProperties.base64Image,
        isDraft: avatarProperties.isDraft ?? false,
        avatarUrl: avatarProperties.avatarUrl,
        avatarLink: avatarProperties.avatarLink,
        thumbnailUrl: avatarProperties.thumbnailUrl,
        renderPose: avatarProperties.renderPose,
        expression: avatarProperties.expression,
        isPublic: avatarProperties.isPublic ?? true,
        metadata: avatarProperties.metadata
      }
    });

    return res.status(200).json({ 
      success: true, 
      message: 'Avatar uploaded successfully',
      avatar 
    });
  } catch (error) {
    console.error('Error uploading avatar:', error);
    return res.status(500).json({ error: 'Failed to upload avatar' });
  }
}

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb', // Increase size limit for base64 images
    },
  },
};