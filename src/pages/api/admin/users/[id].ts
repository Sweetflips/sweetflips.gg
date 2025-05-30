// pages/api/admin/users/[id].ts
import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../../../lib/prisma';
import { parse } from 'cookie';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const {
    query: { id },
    method,
  } = req;

  const cookies = parse(req.headers.cookie || '');
  const accessToken = cookies.access_token;

  if (!accessToken) return res.status(401).json({ error: 'Unauthorized' });

  const userRes = await fetch('https://api.kick.com/public/v1/users', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  const kickData = await userRes.json();
  const kickId = kickData?.data?.[0]?.user_id?.toString();
  if (!kickId) return res.status(401).json({ error: 'Invalid Kick user' });

  const requestingUser = await prisma.user.findUnique({ where: { kickId } });
  if (!requestingUser || requestingUser.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }

  if (method === 'PUT') {
    try {
      const { username, email, tokens, role } = req.body;
      const updated = await prisma.user.update({
        where: { id: Number(id) },
        data: {
          username,
          email,
          tokens,
          role,
        },
      });

      return res.status(200).json(updated);
    } catch (error) {
      return res.status(500).json({ error: 'Failed to update user' });
    }
  }

  if (method === 'DELETE') {
    try {
      await prisma.user.delete({
        where: { id: Number(id) },
      });

      return res.status(204).end();
    } catch (error) {
      return res.status(500).json({ error: 'Failed to delete user' });
    }
  }

  res.setHeader('Allow', ['PUT', 'DELETE']);
  res.status(405).end(`Method ${method} Not Allowed`);
}
