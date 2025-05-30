// pages/api/admin/products/[id].ts
import { prisma } from '../../../../../lib/prisma';
import type { NextApiRequest, NextApiResponse } from 'next';
import { parse } from 'cookie';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const id = parseInt(req.query.id as string);

  if (isNaN(id)) {
    return res.status(400).json({ error: 'Invalid product ID' });
  }

  switch (req.method) {
    case 'PATCH': {
      const { name, description, price, image, active } = req.body;

      try {
        const updated = await prisma.product.update({
          where: { id },
          data: {
            ...(name && { name }),
            ...(description && { description }),
            ...(typeof price === 'number' && { price }),
            ...(image && { image }),
            ...(typeof active === 'boolean' && { active }),
          },
        });
        return res.status(200).json(updated);
      } catch (error) {
        return res.status(500).json({ error: 'Failed to update product' });
      }
    }

    case 'DELETE': {
      try {
        await prisma.product.delete({ where: { id } });
        return res.status(200).json({ message: 'Product deleted' });
      } catch (error) {
        return res.status(500).json({ error: 'Failed to delete product' });
      }
    }

    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}