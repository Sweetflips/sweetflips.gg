// pages/api/admin/products.ts
import { prisma } from '../../../../lib/prisma';
import type { NextApiRequest, NextApiResponse } from 'next';
import { parse } from 'cookie';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const cookies = parse(req.headers.cookie || '');
  const accessToken = cookies.access_token;

  if (!accessToken) return res.status(401).json({ error: 'Unauthorized' });

  // Get Kick user info
  const userRes = await fetch('https://api.kick.com/public/v1/users', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const kickData = await userRes.json();
  const kickId = kickData?.data?.[0]?.user_id?.toString();

  const user = await prisma.user.findUnique({ where: { kickId } });
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }

  if (req.method === 'GET') {
    const products = await prisma.product.findMany({ orderBy: { createdAt: 'desc' } });
    return res.status(200).json(products);
  }

  if (req.method === 'POST') {
    const { name, description, image, price } = req.body;

    if (!name || !image || !price || price < 1) {
      return res.status(400).json({ error: 'Invalid input' });
    }

    const created = await prisma.product.create({
      data: {
        name,
        description,
        image,
        price,
        active: true,
      },
    });

    return res.status(200).json(created);
  }

  res.status(405).json({ error: 'Method not allowed' });
}