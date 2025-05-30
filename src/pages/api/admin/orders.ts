import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../../lib/prisma';
import { parse } from 'cookie';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const cookies = parse(req.headers.cookie || '');
  const accessToken = cookies.access_token;

  if (!accessToken) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    // Get the Kick user
    const kickRes = await fetch('https://api.kick.com/public/v1/users', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const kickData = await kickRes.json();
    const kickId = kickData?.data?.[0]?.user_id?.toString();

    if (!kickId) {
      return res.status(400).json({ error: 'Invalid Kick user' });
    }

    // Get the user from the DB
    const user = await prisma.user.findUnique({
      where: { kickId },
    });

    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden: Admins only' });
    }

    // Fetch all orders
    const orders = await prisma.order.findMany({
      include: {
        user: true,
        product: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return res.status(200).json(orders);
  } catch (err) {
    console.error('Error fetching admin orders:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
