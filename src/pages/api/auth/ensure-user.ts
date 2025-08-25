import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import { prisma } from '@/lib/prisma';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No authorization token' });
    }

    const token = authHeader.substring(7);
    
    // Verify token with Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    // Check if user exists in our database
    let dbUser = await prisma.user.findFirst({
      where: {
        auth_user_id: user.id
      }
    });

    // If user doesn't exist, create them
    if (!dbUser) {
      dbUser = await prisma.user.create({
        data: {
          email: user.email || `${user.id}@supabase.local`,
          username: user.user_metadata?.username || user.email?.split('@')[0] || `user_${Date.now()}`,
          auth_user_id: user.id,
          tokens: 100, // Give new users some starting tokens
          role: 'user'
        }
      });
      console.log('Created new user record:', dbUser.id);
    }

    return res.status(200).json({
      success: true,
      user: {
        id: dbUser.id,
        email: dbUser.email,
        username: dbUser.username,
        auth_user_id: dbUser.auth_user_id,
        tokens: dbUser.tokens,
        role: dbUser.role
      }
    });
  } catch (error) {
    console.error('Error ensuring user:', error);
    return res.status(500).json({
      error: 'Failed to ensure user record',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}