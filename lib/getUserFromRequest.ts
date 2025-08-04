import { parse } from 'cookie';
import { prisma } from './prisma';
import { NextApiRequest, NextApiResponse } from 'next';
import { createClientForAuth } from './supabase';

export async function getUserFromRequest(req: NextApiRequest, res: NextApiResponse) {
  // First try Kick authentication
  const cookies = parse(req.headers.cookie || '');
  const kickId = cookies.kick_id;

  if (kickId) {
    const user = await prisma.user.findUnique({
      where: { kickId },
    });
    
    if (user) {
      return user;
    }
  }

  // Try Supabase authentication
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    const supabase = createClientForAuth();
    
    try {
      const { data: { user: supabaseUser }, error } = await supabase.auth.getUser(token);
      
      if (supabaseUser && !error && supabaseUser.email) {
        // Find the user by email
        const user = await prisma.user.findFirst({
          where: { email: supabaseUser.email },
        });
        
        if (user) {
          return user;
        }
        
        // If user doesn't exist, create them
        const newUser = await prisma.user.create({
          data: {
            email: supabaseUser.email,
            username: supabaseUser.email.split('@')[0],
            kickId: null,
            tokens: 0,
            role: 'USER',
          },
        });
        
        return newUser;
      }
    } catch (error) {
      console.error('Error verifying Supabase token:', error);
    }
  }

  return null;
}