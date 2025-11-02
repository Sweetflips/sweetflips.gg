import { parse } from 'cookie';
import { prisma } from './prisma';
import { NextApiRequest, NextApiResponse } from 'next';
import { createClientForAuth } from './supabase';

export async function getUserFromRequest(req: NextApiRequest, res: NextApiResponse) {
  // First try Kick authentication
  const cookies = parse(req.headers.cookie || '');
  const kickAccessToken = cookies.access_token;

  if (kickAccessToken) {
    try {
      // Validate the Kick token
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
            return user;
          }
        }
      }
    } catch (error) {
      console.error('Error verifying Kick token:', error);
    }
  }

  // Try Supabase authentication
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    const supabase = createClientForAuth();

    try {
      const { data: { user: supabaseUser }, error } = await supabase.auth.getUser(token);

      if (supabaseUser && !error) {
        // Find the user by auth_user_id first
        const user = await prisma.user.findUnique({
          where: { auth_user_id: supabaseUser.id },
        });

        if (user) {
          return user;
        }

        // If not found by auth_user_id, try by email
        if (supabaseUser.email) {
          const userByEmail = await prisma.user.findFirst({
            where: { email: supabaseUser.email },
          });

          if (userByEmail) {
            // Update the auth_user_id if it's missing
            if (!userByEmail.auth_user_id) {
              await prisma.user.update({
                where: { id: userByEmail.id },
                data: { auth_user_id: supabaseUser.id },
              });
            }
            return userByEmail;
          }

          // If user doesn't exist, create them
          const newUser = await prisma.user.create({
            data: {
              email: supabaseUser.email,
              username: supabaseUser.email.split('@')[0],
              auth_user_id: supabaseUser.id,
              kickId: null,
              tokens: 0,
              role: 'USER',
            },
          });

          return newUser;
        }
      }
    } catch (error) {
      console.error('Error verifying Supabase token:', error);
    }
  }

  return null;
}
