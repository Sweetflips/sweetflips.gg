import { NextApiRequest, NextApiResponse } from 'next';
import { randomBytes, createHash, randomUUID } from 'crypto';
import { prisma } from '../../../../lib/prisma';
import { addMinutes } from 'date-fns';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const VERCEL_URL = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined;
  const NEXT_PUBLIC_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
  let baseUrl = VERCEL_URL || NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

  // Ensure no trailing slash
  if (baseUrl.endsWith('/')) {
    baseUrl = baseUrl.slice(0, -1);
  }

  const redirectUri = `${baseUrl}/api/auth/callback`;

  const codeVerifier = randomBytes(32).toString('base64url');
  const codeChallenge = createHash('sha256').update(codeVerifier).digest('base64url');
  const sessionId = randomUUID();
  const expiresAt = addMinutes(new Date(), 5);

  await prisma.oAuthSession.create({
    data: {
      id: sessionId,
      codeVerifier,
      expiresAt,
    },
  });

  const redirectUrl = `https://id.kick.com/oauth/authorize?response_type=code&client_id=${process.env.NEXT_PUBLIC_KICK_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${sessionId}&scope=user:read&code_challenge=${codeChallenge}&code_challenge_method=S256`;

  res.status(200).json({
    redirectUrl,
    codeVerifier,
    expiresAt: expiresAt.getTime(),
  });
}