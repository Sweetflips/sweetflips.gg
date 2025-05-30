import type { NextApiRequest, NextApiResponse } from 'next';
import { parse } from 'cookie';
import { prisma } from '../../../../lib/prisma';
import { Decimal } from '@prisma/client/runtime/library';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', process.env.PLINKO_URL || '');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-plinko-secret');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    return res.status(200).end();
  }

  res.setHeader('Access-Control-Allow-Origin', process.env.PLINKO_URL || '');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (req.headers['x-plinko-secret'] !== process.env.PLINKO_SECRET_TOKEN) {
    return res.status(401).json({ error: 'Invalid secret token' });
  }

  const cookies = parse(req.headers.cookie || '');
  const accessToken = cookies.access_token;
  const kickId = cookies.kick_id;

  if (!accessToken || !kickId) {
    return res.status(401).json({ error: 'Unauthorized – missing token or user ID' });
  }

  const { amount } = req.body;
  if (typeof amount !== 'number' || amount <= 0) {
    return res.status(400).json({ error: 'Invalid bet amount' });
  }

  try {
    // Atomic update with balance check
    const updatedUser = await prisma.user.updateMany({
      where: {
        kickId,
        tokens: { gte: amount },
      },
      data: {
        tokens: {
          decrement: amount,
        },
      },
    });

    if (updatedUser.count === 0) {
      return res.status(403).json({ error: 'Insufficient balance' });
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Spend error:', error);
    return res.status(500).json({ error: 'Failed to process spend' });
  }
}