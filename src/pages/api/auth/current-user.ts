import { NextApiRequest, NextApiResponse } from 'next';
import { parse } from 'cookie';
import { prisma } from '../../../../lib/prisma';
import { createClientForAuth } from '../../../../lib/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // First check for Kick.com OAuth token
    const cookies = parse(req.headers.cookie || '');
    const accessToken = cookies.access_token;

    if (accessToken) {
      // Try Kick authentication
      const kickResponse = await fetch('https://api.kick.com/public/v1/users', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
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
              user: {
                ...user,
                email: user.email || data?.[0]?.email || null,
                username: user.username || data?.[0]?.username || null,
              }, 
              userData: userData ?? null,
              authType: 'kick'
            });
          }
        }
      }
    }

    // If Kick auth failed or no token, try Supabase
    const supabase = createClientForAuth();
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const { data: { user: supabaseUser }, error } = await supabase.auth.getUser(token);
      
      if (supabaseUser && !error) {
        // Find or create user in database
        let user = await prisma.user.findFirst({
          where: { email: supabaseUser.email! },
        });

        if (!user) {
          // Create user if doesn't exist
          user = await prisma.user.create({
            data: {
              email: supabaseUser.email!,
              username: supabaseUser.email!.split('@')[0], // Default username from email
              kickId: null,
              tokens: 0,
              role: 'USER',
            },
          });
        }

        return res.status(200).json({ 
          user: {
            ...user,
            email: user.email || supabaseUser.email,
            username: user.username || supabaseUser.email?.split('@')[0],
          },
          userData: null,
          authType: 'supabase'
        });
      }
    }

    // No valid authentication found
    return res.status(401).json({ error: 'Unauthorized' });

  } catch (error) {
    console.error('Error in current-user endpoint:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}