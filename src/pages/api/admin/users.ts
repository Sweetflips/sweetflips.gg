// pages/api/admin/users.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../../lib/prisma';
import { parse } from 'cookie';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const cookies = parse(req.headers.cookie || '');
  const accessToken = cookies.access_token;

  if (!accessToken) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // Get Kick user info from accessToken
  const userRes = await fetch('https://api.kick.com/public/v1/users', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  const kickData = await userRes.json();
  const kickId = kickData?.data?.[0]?.user_id?.toString();

  if (!kickId) {
    return res.status(401).json({ error: 'Invalid Kick user' });
  }

  const user = await prisma.user.findUnique({ where: { kickId } });

  if (!user || user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }

  // Authorized admin request
  if (req.method === 'GET') {
    try {
      const users = await prisma.user.findMany({
        orderBy: { id: 'asc' },
        select: {
          id: true,
          username: true,
          email: true,
          kickId: true,
          tokens: true,
          role: true,
          createdAt: true,
        },
      });

      return res.status(200).json(users);
    } catch (error) {
      return res.status(500).json({ error: 'Failed to fetch users' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
