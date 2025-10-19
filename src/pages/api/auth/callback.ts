import { NextApiRequest, NextApiResponse } from 'next';
import { serialize } from 'cookie';
import { prisma } from '../../../../lib/prisma';
import { getBaseUrl } from '../../../../lib/getBaseUrl';
import { COOKIE_OPTIONS } from '../../../lib/cookies';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Debug: Log all query parameters received
  console.log('OAuth callback - Full query params:', req.query);
  console.log('OAuth callback - URL:', req.url);

  const { code, state, error } = req.query;
  
  // Handle OAuth errors from Kick
  if (error) {
    console.error('OAuth error from Kick:', error);
    return res.status(400).json({ error: `OAuth failed: ${error}` });
  }
  if (!code || !state || typeof state !== 'string') {
    console.error('OAuth callback - Missing parameters:', { code: !!code, state: !!state, stateType: typeof state });
    return res.status(400).json({ error: 'No valid authorization parameters found in callback URL' });
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

  const redirectUri = 'https://sweetflips.gg/auth/callback';
  
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

    // Fetch user info from Kick using the access token
    const kickUserResp = await fetch('https://api.kick.com/public/v1/users', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!kickUserResp.ok) {
      const errText = await kickUserResp.text();
      console.error('Failed to fetch user info from Kick:', errText);
      return res.status(400).json({ error: 'Failed to fetch user info from Kick' });
    }

    const kickData = await kickUserResp.json();
    const kickUser = kickData?.data?.[0];

    if (!kickUser || !kickUser.user_id || !kickUser.name) {
      console.error('Invalid Kick user data received:', kickData);
      return res.status(400).json({ error: 'Invalid user data from Kick' });
    }

    const kickId = String(kickUser.user_id);
    const username = kickUser.name as string;
    const email = (kickUser.email as string) || '';
    const refreshToken = (tokenData.refresh_token as string) || undefined;

    // Save or update user in DB
    try {
      console.log('ℹ️ Saving user to DB - Action:', action);
      console.log('ℹ️ User data:', { kickId, username, email, hasRefreshToken: !!refreshToken, auth_user_id });

      if (action === 'link' && auth_user_id) {
        // Linking flow: attach Kick account to existing Supabase user
        const existingByAuth = await prisma.user.findUnique({ where: { auth_user_id } });
        if (existingByAuth) {
          try {
            console.log('🔄 Updating existing Supabase user with Kick data:', { userId: existingByAuth.id, kickId, username });
            await prisma.user.update({
              where: { id: existingByAuth.id },
              data: {
                kickId,
                email,
                username,
                ...(refreshToken && { refresh_token: refreshToken }),
                kick_linked_at: new Date(),
              },
            });
            console.log('✅ Successfully updated user with Kick data');
          } catch (e: any) {
            console.error('❌ Failed to update Supabase user with Kick data:', e);
            const target = e?.meta?.target;
            const isKickIdConflict = e?.code === 'P2002' && (Array.isArray(target) ? target.includes('kickId') : target === 'kickId');
            const isAuthUserIdConflict = e?.code === 'P2002' && (Array.isArray(target) ? target.includes('auth_user_id') : target === 'auth_user_id');

            console.log('🔍 Constraint conflict details:', {
              errorCode: e?.code,
              target,
              isKickIdConflict,
              isAuthUserIdConflict
            });

            if (isKickIdConflict) {
              // A user with this kickId already exists; merge by moving auth_user_id to that record
              console.log('🔄 Handling kickId conflict - merging accounts');
              const existingByKick = await prisma.user.findUnique({ where: { kickId } });
              if (existingByKick) {
                console.log('📝 Found existing user with same kickId:', {
                  existingKickId: existingByKick.id,
                  existingAuthUserId: existingByKick.auth_user_id,
                  newAuthUserId: auth_user_id
                });

                // Clear auth_user_id on the Supabase-only record to free the unique constraint
                await prisma.user.update({
                  where: { id: existingByAuth.id },
                  data: { auth_user_id: null }
                });

                // Assign auth_user_id to the Kick record and update fields
                await prisma.user.update({
                  where: { id: existingByKick.id },
                  data: {
                    auth_user_id,
                    email,
                    username,
                    ...(refreshToken && { refresh_token: refreshToken }),
                    kick_linked_at: new Date(),
                  },
                });
                console.log('✅ Successfully merged accounts');
              }
            } else if (isAuthUserIdConflict) {
              console.error('❌ auth_user_id conflict - this should not happen as we searched by it');
            } else {
              console.error('❌ Unknown constraint error while linking Kick to Supabase user:', e);
              throw e; // Re-throw for outer handler
            }
          }
        } else {
          // No Supabase record found; create or update by kickId and attach auth_user_id
          await prisma.user.upsert({
            where: { kickId },
            update: {
              email,
              username,
              ...(refreshToken && { refresh_token: refreshToken }),
              auth_user_id,
            },
            create: {
              kickId,
              email,
              username,
              auth_user_id,
              tokens: 0,
              ...(refreshToken && { refresh_token: refreshToken }),
            },
          });
        }
      } else {
        // Regular login flow: upsert by kickId
        console.log('🔄 Regular login flow - upserting user by kickId:', { kickId, username });
        try {
          await prisma.user.upsert({
            where: { kickId },
            update: {
              email,
              username,
              ...(refreshToken && { refresh_token: refreshToken }),
            },
            create: {
              kickId,
              email,
              username,
              tokens: 0,
              ...(refreshToken && { refresh_token: refreshToken }),
            },
          });
          console.log('✅ Successfully upserted user');
        } catch (e: any) {
          console.error('❌ Failed to upsert user:', e);
          console.error('❌ Upsert error details:', {
            message: e?.message,
            code: e?.code,
            meta: e?.meta,
            kickId,
            username
          });
          throw e;
        }
      }

      // Link UserData record by username if it exists and is not yet linked
      try {
        const userDataMatch = await prisma.userData.findMany({
          where: {
            username,
            kickId: null,
          },
        });

        if (userDataMatch.length === 1) {
          await prisma.userData.update({
            where: { id: userDataMatch[0].id },
            data: {
              kickId,
              updatedAt: new Date(),
            },
          });
          console.log(`✔️ Linked kickId ${kickId} to existing UserData record for ${username}`);
        }
      } catch (e) {
        console.warn('Warning: Failed to link UserData record:', e);
      }
    } catch (saveErr: any) {
      console.error('❌ Failed to save user info to DB:', saveErr);
      console.error('❌ Error details:', {
        message: saveErr?.message,
        code: saveErr?.code,
        meta: saveErr?.meta,
        cause: saveErr?.cause
      });

      // Log the full error stack trace
      if (saveErr.stack) {
        console.error('❌ Stack trace:', saveErr.stack);
      }

      const target = saveErr?.meta?.target;
      const isKickIdConflict = saveErr?.code === 'P2002' && (Array.isArray(target) ? target.includes('kickId') : target === 'kickId');

      if (!isKickIdConflict) {
        // Send a more detailed error response for debugging
        return res.status(500).json({
          error: 'Failed to save user info to DB',
          details: saveErr?.message || 'Unknown error',
          code: saveErr?.code
        });
      }
      // If duplicate kickId, treat as success to unblock login
      console.log('⚠️ Duplicate kickId detected, treating as success for login flow');
    }

    // Set cookies for subsequent requests
    const cookies: string[] = [
      // Server APIs expect 'access_token' cookie for Kick
      serialize('access_token', accessToken, COOKIE_OPTIONS),
      // Unity helpers also use 'authToken'
      serialize('authToken', accessToken, COOKIE_OPTIONS),
    ];

    if (auth_user_id) {
      cookies.push(serialize('authUserId', auth_user_id, COOKIE_OPTIONS));
    }

    res.setHeader('Set-Cookie', cookies);

    // Redirect back to account page or home
    return res.redirect('/account');
  } catch (error) {
    console.error('Error handling Kick callback:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
