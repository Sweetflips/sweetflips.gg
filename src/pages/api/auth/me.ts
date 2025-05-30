import { NextApiRequest, NextApiResponse } from 'next';
import { parse } from 'cookie';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const cookies = parse(req.headers.cookie || '');
  const accessToken = cookies.access_token;

  if (!accessToken) {
    return res.status(401).json({ error: 'Unauthorized - No token' });
  }

  try {
    const response = await fetch('https://api.kick.com/public/v1/users', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      return res.status(response.status).json({ error: 'Failed to fetch user from Kick' });
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (err) {
    console.error('Kick API error:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}