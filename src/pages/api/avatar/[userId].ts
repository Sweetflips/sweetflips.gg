import { createClient } from '@supabase/supabase-js';
import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../../lib/prisma';

// Create a Supabase client for auth verification
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    }
  }
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId } = req.query;

    if (!userId || typeof userId !== 'string') {
      return res.status(400).json({ error: 'Invalid userId' });
    }

    // Try to parse as number first (legacy userId)
    const userIdNum = parseInt(userId, 10);
    let avatar = null;

    if (!isNaN(userIdNum)) {
      // Legacy userId lookup
      avatar = await prisma.avatar.findUnique({
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
    } else {
      // Try auth_user_id lookup (UUID format)
      avatar = await prisma.avatar.findUnique({
        where: { auth_user_id: userId },
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
    }

    // If still no avatar found, try authentication-based lookup
    if (!avatar) {
      const authHeader = req.headers.authorization;

      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7);

        // Verify the Supabase token
        const { data: { user: authUser }, error: authError } = await supabase.auth.getUser(token);

        if (!authError && authUser) {
          // Try to find avatar by auth_user_id
          avatar = await prisma.avatar.findUnique({
            where: { auth_user_id: authUser.id },
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
        }
      }
    }

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
