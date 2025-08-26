import { NextApiRequest, NextApiResponse } from 'next';
import { parse } from 'cookie';
import { prisma } from '../../../../lib/prisma';
import { createClient } from '@supabase/supabase-js';

// Create a Supabase client for auth verification only
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    }
  }
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // First, try Kick authentication
    const cookies = parse(req.headers.cookie || '');
    const kickAccessToken = cookies.access_token;

    if (kickAccessToken) {
      // Try to authenticate with Kick
      const kickResponse = await fetch('https://api.kick.com/public/v1/users', {
        headers: {
          Authorization: `Bearer ${kickAccessToken}`,
        },
      });

      if (kickResponse.ok) {
        const { data } = await kickResponse.json();
        const kickId = data?.[0]?.user_id?.toString();

        if (kickId) {
          const user = await prisma.user.findUnique({
            where: { kickId },
          });

          if (user) {
            const userData = await prisma.userData.findUnique({
              where: { kickId },
            });

            return res.status(200).json({ 
              user, 
              userData: userData ?? null,
              authType: 'kick'
            });
          }
        }
      }
    }

    // If Kick auth failed or no Kick token, try Supabase auth
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const supabaseToken = authHeader.substring(7);
      
      // Verify the Supabase token
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser(supabaseToken);
      
      if (authError || !authUser) {
        return res.status(401).json({ error: 'Invalid Supabase token' });
      }

      // Fetch user from database using Prisma (bypasses RLS)
      const user = await prisma.user.findUnique({
        where: { auth_user_id: authUser.id },
      });

      if (!user) {
        return res.status(404).json({ error: 'User not found in database' });
      }

      // Fetch user data if it exists - UserData uses kickId, not userId
      let userData = null;
      if (user.kickId) {
        userData = await prisma.userData.findUnique({
          where: { kickId: user.kickId },
        });
      }

      return res.status(200).json({ 
        user, 
        userData: userData ?? null,
        authType: 'supabase'
      });
    }

    // No valid authentication found
    return res.status(401).json({ error: 'No valid authentication found' });
    
  } catch (error) {
    console.error('Error in /api/user/profile:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}