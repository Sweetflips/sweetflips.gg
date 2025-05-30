import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../../lib/prisma';
import { getUserFromRequest } from '@/../lib/getUserFromRequest';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = await getUserFromRequest(req, res);

  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const orders = await prisma.order.findMany({
      where: { userId: user.id },
      include: { product: true },
      orderBy: { createdAt: 'desc' },
    });

    return res.status(200).json(orders);
  } catch (err) {
    console.error('Failed to load orders:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
