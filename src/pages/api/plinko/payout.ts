import { NextApiRequest, NextApiResponse } from 'next';
import { parse } from 'cookie';
import { prisma } from '../../../../lib/prisma';
import { Decimal } from '@prisma/client/runtime/library';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const allowedOrigin = process.env.PLINKO_URL;

  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', allowedOrigin || '');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-plinko-secret');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    return res.status(200).end();
  }

  res.setHeader('Access-Control-Allow-Origin', allowedOrigin || '');
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

  const user = await prisma.user.findUnique({
    where: { kickId },
  });

  if (!user) {
    return res.status(401).json({ error: 'User not found' });
  }

  const { amount } = req.body;
  const payout = parseFloat(amount);

  if (isNaN(payout) || payout <= 0) {
    return res.status(400).json({ error: 'Invalid payout amount' });
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      tokens: {
        increment: new Decimal(payout),
      },
    },
  });

  return res.status(200).json({ success: true });
}