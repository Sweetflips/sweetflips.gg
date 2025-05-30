import { NextApiRequest, NextApiResponse } from 'next';
import { parse } from 'cookie';
import { prisma } from '../../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // ✅ CORS headers
  res.setHeader('Access-Control-Allow-Origin', process.env.PLINKO_URL || '');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  // ✅ Handle OPTIONS preflight
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(200).end();
  }

  // ✅ Only allow GET requests for this endpoint
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const cookies = parse(req.headers.cookie || '');
  const accessToken = cookies.access_token;

  if (!accessToken) {
    return res.status(401).json({ error: 'Unauthorized – no token' });
  }

  const fetchKickUser = async (token: string) => {
    return await fetch('https://api.kick.com/public/v1/users', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  };

  let kickResponse = await fetchKickUser(accessToken);

  if (kickResponse.status === 401) {
    return res.status(401).json({ error: 'Access token expired. Please log in again.' });
  }

  if (!kickResponse.ok) {
    return res.status(400).json({ error: 'Failed to fetch user info from Kick' });
  }

  const { data } = await kickResponse.json();
  const kickId = data?.[0]?.user_id?.toString();

  if (!kickId) {
    return res.status(400).json({ error: 'Invalid Kick user data (missing kickId)' });
  }

  const user = await prisma.user.findUnique({
    where: { kickId },
  });

  if (!user) {
    return res.status(404).json({ error: 'User not found in database' });
  }

  const userData = await prisma.userData.findUnique({
    where: { kickId },
  });

  return res.status(200).json({ user, userData: userData ?? null });
}
