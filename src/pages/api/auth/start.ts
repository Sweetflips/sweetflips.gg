import { createHash, randomBytes, randomUUID } from 'crypto';
import { addMinutes } from 'date-fns';
import { NextApiRequest, NextApiResponse } from 'next';
import { getBaseUrl } from '../../../../lib/getBaseUrl';
import { prisma } from '../../../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    let baseUrl = getBaseUrl();
    if (baseUrl.endsWith('/')) baseUrl = baseUrl.slice(0, -1);

    const redirectUri = `${baseUrl}/api/auth/callback`;

    // Debug: Log the redirect URI being used
    console.log('OAuth start - redirectUri:', redirectUri);
    console.log('OAuth start - baseUrl:', baseUrl);
    console.log('OAuth start - VERCEL_ENV:', process.env.VERCEL_ENV);
    console.log('OAuth start - VERCEL_URL:', process.env.VERCEL_URL);

    // PKCE
    const codeVerifier = randomBytes(32).toString('base64url');
    const codeChallenge = createHash('sha256').update(codeVerifier).digest('base64url');
    const sessionId = randomUUID();

    await prisma.oAuthSession.create({
      data: {
        id: sessionId,
        codeVerifier,
        expiresAt: addMinutes(new Date(), 10),
      },
    });

    const clientId = process.env.NEXT_PUBLIC_KICK_CLIENT_ID!;

    const authUrl = new URL('https://kick.com/oauth/authorize');
    authUrl.searchParams.append('client_id', clientId);
    authUrl.searchParams.append('response_type', 'code');
    authUrl.searchParams.append('scope', 'user:read');
    authUrl.searchParams.append('redirect_uri', redirectUri);
    authUrl.searchParams.append('code_challenge', codeChallenge);
    authUrl.searchParams.append('code_challenge_method', 'S256');
    authUrl.searchParams.append('state', JSON.stringify({ sessionId, action: 'login' }));

    return res.status(200).json({ redirectUrl: authUrl.toString(), codeVerifier, expiresAt: Date.now() + 10 * 60 * 1000, sessionId });
  } catch (err) {
    console.error('Error starting Kick OAuth:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
