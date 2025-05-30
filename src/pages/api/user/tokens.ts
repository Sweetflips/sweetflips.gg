import type { NextApiRequest, NextApiResponse } from 'next';
import { parse } from 'cookie';
import { prisma } from '../../../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // CORS for Plinko (optional, keep if needed)
  res.setHeader('Access-Control-Allow-Origin', process.env.PLINKO_URL || '');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const cookies = parse(req.headers.cookie || '');
  const accessToken = cookies.access_token;
  const kickId = cookies.kick_id;

  // Check both auth and identity
  if (!accessToken || !kickId) {
    return res.status(401).json({ error: 'Unauthorized: Missing token or user ID' });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { kickId },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found in database' });
    }

    return res.status(200).json({ tokens: user.tokens });
  } catch (error) {
    console.error('Error fetching token balance:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}