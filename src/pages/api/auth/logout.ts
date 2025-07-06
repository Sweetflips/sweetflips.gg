import { serialize } from 'cookie';
import { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // Clear the access_token cookie
  res.setHeader('Set-Cookie', serialize('access_token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: -1,
    path: '/',
    sameSite: 'lax',
  }));

  // Return success response for client-side logout handling
  res.status(200).json({ success: true });
}