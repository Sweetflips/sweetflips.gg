import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';

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

    const userIdNum = parseInt(userId as string);
    if (isNaN(userIdNum)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    // Fetch user with avatar
    const user = await prisma.user.findUnique({
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

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.status(200).json({ user });
  } catch (error) {
    console.error('Error fetching user info:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}