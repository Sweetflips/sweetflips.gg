import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';
import { parse } from 'cookie';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const cookies = parse(req.headers.cookie || '');
  const accessToken = cookies.access_token;
  if (!accessToken) return res.status(401).json({ error: 'Unauthorized' });

  const { productId, quantity } = req.body;
  const qty = parseInt(quantity);
  if (!productId || isNaN(qty) || qty < 1) {
    return res.status(400).json({ error: 'Invalid product or quantity' });
  }

  try {
    // Get Kick user ID
    const userInfo = await fetch('https://api.kick.com/public/v1/users', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const userData = await userInfo.json();
    const kickId = userData?.data?.[0]?.user_id?.toString();

    if (!kickId) return res.status(401).json({ error: 'Invalid Kick user' });

    const user = await prisma.user.findUnique({ where: { kickId } });
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!user || !product || !product.active) {
      return res.status(404).json({ error: 'User or product not found' });
    }

    const total = product.price * qty;
    if (Number(user.tokens) < total) {
      return res.status(400).json({ error: 'Not enough tokens' });
    }

    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: { tokens: { decrement: total } },
      }),
      prisma.order.create({
        data: {
          userId: user.id,
          productId: product.id,
          quantity: qty,
          total,
        },
      }),
    ]);

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Buy error:', err);
    return res.status(500).json({ error: 'Something went wrong' });
  }
}