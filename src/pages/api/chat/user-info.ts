import { prisma } from '@/lib/prisma';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // This endpoint is public as it only returns public user info
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const userIdStr = userId as string;
    const userIdNum = parseInt(userIdStr);
    let user = null;

    if (!isNaN(userIdNum)) {
      // Legacy userId lookup
      user = await prisma.user.findUnique({
        where: { id: userIdNum },
        select: {
          id: true,
          username: true,
          avatar: {
            select: {
              base64Image: true,
              avatarId: true,
              gender: true
            }
          }
        }
      });
    } else {
      // Try auth_user_id lookup (UUID format)
      user = await prisma.user.findUnique({
        where: { auth_user_id: userIdStr },
        select: {
          id: true,
          username: true,
          avatar: {
            select: {
              base64Image: true,
              avatarId: true,
              gender: true
            }
          }
        }
      });
    }

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.status(200).json({ user });
  } catch (error) {
    console.error('Error fetching user info:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
