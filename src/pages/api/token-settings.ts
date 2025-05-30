import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const settings = await prisma.tokenSettings.findFirst();
    return res.status(200).json({ conversionRate: settings?.conversionRate || 100 });
  }

  if (req.method === 'POST') {
    const { conversionRate } = req.body;
    if (!conversionRate || conversionRate < 1) {
      return res.status(400).json({ error: 'Invalid conversion rate' });
    }

    const settings = await prisma.tokenSettings.findFirst();
    if (settings) {
      await prisma.tokenSettings.update({
        where: { id: settings.id },
        data: { conversionRate },
      });
    } else {
      await prisma.tokenSettings.create({
        data: { conversionRate },
      });
    }

    return res.status(200).json({ success: true });
  }

  res.status(405).json({ error: 'Method not allowed' });
}