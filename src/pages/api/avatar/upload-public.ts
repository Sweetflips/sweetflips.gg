import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../../lib/prisma';

/**
 * PUBLIC Avatar Upload Endpoint
 * This endpoint allows avatar creation without authentication
 * USE WITH CAUTION - Only for testing or public avatar creation
 * 
 * For production, use /api/avatar/upload with proper authentication
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId, authUserId, avatarProperties } = req.body;

    // Validate input
    if ((!userId && !authUserId) || !avatarProperties) {
      return res.status(400).json({ 
        error: 'Missing user identifier (userId or authUserId) or avatarProperties',
        hint: 'Provide either userId (number) or authUserId (UUID string)'
      });
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
      message: 'Avatar uploaded successfully (PUBLIC endpoint)',
      avatar,
      warning: 'This is a public endpoint. For production, use authenticated endpoint /api/avatar/upload'
    });
  } catch (error) {
    console.error('Error uploading avatar (public):', error);
    
    // Provide more detailed error information
    if (error instanceof Error) {
      return res.status(500).json({ 
        error: 'Failed to upload avatar',
        details: error.message,
        hint: 'Check that userId exists in the User table or provide a valid authUserId'
      });
    }
    
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