import { NextApiRequest, NextApiResponse } from 'next';
import { serialize } from 'cookie';
import { prisma } from '../../../../lib/prisma';
import { getBaseUrl } from '../../../../lib/getBaseUrl';
import { COOKIE_OPTIONS } from '../../../lib/cookies';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { code, state, error } = req.query;
  
  // Handle OAuth errors from Kick
  if (error) {
    console.error('OAuth error from Kick:', error);
    return res.status(400).json({ error: `OAuth failed: ${error}` });
  }
  if (!code || !state || typeof state !== 'string') {
    return res.status(400).json({ error: 'Missing code or state' });
  }

  // Parse state to handle both regular auth and account linking
  let sessionId: string;
  let action: string = 'login';
  let auth_user_id: string | null = null;

  try {
    const stateData = JSON.parse(state);
    sessionId = stateData.sessionId;
    action = stateData.action || 'login';
    auth_user_id = stateData.auth_user_id || null;
  } catch {
    // Fallback for old format (plain sessionId)
    sessionId = state as string;
  }

  // Fetch code_verifier from DB using session ID
  const session = await prisma.oAuthSession.findUnique({ where: { id: sessionId } });
  if (!session || new Date() > session.expiresAt) {
    return res.status(400).json({ error: 'Invalid or expired session' });
  }

  const codeVerifier = session.codeVerifier;

  const clientId = process.env.NEXT_PUBLIC_KICK_CLIENT_ID!;
  const clientSecret = process.env.KICK_CLIENT_SECRET!;

  let baseUrl = getBaseUrl();
  if (baseUrl.endsWith('/')) baseUrl = baseUrl.slice(0, -1);

  const redirectUri = process.env.KICK_REDIRECT_URI || `${baseUrl}/auth/callback`;
  
  // Debug: Log the redirect URI being used
  console.log('OAuth callback - redirectUri:', redirectUri);
  console.log('OAuth callback - baseUrl:', baseUrl);

  try {
    // Exchange code for tokens
    const tokenResp = await fetch('https://id.kick.com/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        code: String(code),
        grant_type: 'authorization_code',
        redirect_uri: redirectUri,
        code_verifier: codeVerifier,
      }).toString(),
    });

    if (!tokenResp.ok) {
      const errText = await tokenResp.text();
      console.error('Kick token exchange failed:', errText);
      return res.status(400).json({ error: 'Token exchange failed' });
    }

    const tokenData = await tokenResp.json();
    const accessToken = tokenData.access_token as string;

    // Set basic cookies so UI can proceed; adjust as needed
    const cookies = [
      serialize('authToken', accessToken, COOKIE_OPTIONS),
      serialize('authUserId', auth_user_id ?? '', COOKIE_OPTIONS),
    ];
    res.setHeader('Set-Cookie', cookies);

    // Redirect back to account page or home
    return res.redirect('/account');
  } catch (error) {
    console.error('Error handling Kick callback:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
