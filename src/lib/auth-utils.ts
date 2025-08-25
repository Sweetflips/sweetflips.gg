import { NextApiRequest } from 'next';
import { createClient } from '@supabase/supabase-js';
import { prisma } from '../../lib/prisma';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export interface AuthUser {
  id: number;
  email: string;
  username: string;
  auth_user_id?: string | null;
  role?: string | null;
}

/**
 * Get user from request headers or cookies
 * Checks both Supabase auth and session cookies
 */
export async function getUserFromRequest(req: NextApiRequest): Promise<AuthUser | null> {
  try {
    // First try to get user from Authorization header (Bearer token)
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      
      // Verify token with Supabase
      const { data: { user }, error } = await supabase.auth.getUser(token);
      
      if (!error && user) {
        // Get the user from our database using auth_user_id
        const dbUser = await prisma.user.findFirst({
          where: {
            auth_user_id: user.id
          }
        });
        
        if (dbUser) {
          return {
            id: dbUser.id,
            email: dbUser.email,
            username: dbUser.username,
            auth_user_id: dbUser.auth_user_id,
            role: dbUser.role
          };
        }
      }
    }
    
    // Try to get user from cookie session
    const cookies = parseCookies(req.headers.cookie || '');
    
    // Check for Supabase auth cookies
    const sbAccessToken = cookies['sb-access-token'] || cookies['supabase-auth-token'];
    if (sbAccessToken) {
      const { data: { user }, error } = await supabase.auth.getUser(sbAccessToken);
      
      if (!error && user) {
        const dbUser = await prisma.user.findFirst({
          where: {
            auth_user_id: user.id
          }
        });
        
        if (dbUser) {
          return {
            id: dbUser.id,
            email: dbUser.email,
            username: dbUser.username,
            auth_user_id: dbUser.auth_user_id,
            role: dbUser.role
          };
        }
      }
    }
    
    // Check for custom session token (for email/password users)
    const sessionToken = cookies['session-token'] || cookies['auth-token'];
    if (sessionToken) {
      // You might want to implement your own session validation here
      // For now, we'll try to decode it as a user ID
      const userId = parseInt(sessionToken, 10);
      if (!isNaN(userId)) {
        const dbUser = await prisma.user.findUnique({
          where: { id: userId }
        });
        
        if (dbUser) {
          return {
            id: dbUser.id,
            email: dbUser.email,
            username: dbUser.username,
            auth_user_id: dbUser.auth_user_id,
            role: dbUser.role
          };
        }
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error getting user from request:', error);
    return null;
  }
}

/**
 * Parse cookies from cookie header string
 */
function parseCookies(cookieHeader: string): Record<string, string> {
  const cookies: Record<string, string> = {};
  
  if (!cookieHeader) return cookies;
  
  cookieHeader.split(';').forEach(cookie => {
    const [key, value] = cookie.trim().split('=');
    if (key && value) {
      cookies[key] = decodeURIComponent(value);
    }
  });
  
  return cookies;
}

/**
 * Check if a user has a specific role
 */
export function hasRole(user: AuthUser | null, role: string): boolean {
  return user?.role === role;
}

/**
 * Check if a user is an admin
 */
export function isAdmin(user: AuthUser | null): boolean {
  return hasRole(user, 'admin');
}

/**
 * Get user by auth user ID
 */
export async function getUserByAuthId(authUserId: string): Promise<AuthUser | null> {
  try {
    const user = await prisma.user.findFirst({
      where: {
        auth_user_id: authUserId
      }
    });
    
    if (!user) return null;
    
    return {
      id: user.id,
      email: user.email,
      username: user.username,
      auth_user_id: user.auth_user_id,
      role: user.role
    };
  } catch (error) {
    console.error('Error getting user by auth ID:', error);
    return null;
  }
}

/**
 * Get user by public user ID
 */
export async function getUserById(userId: number): Promise<AuthUser | null> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });
    
    if (!user) return null;
    
    return {
      id: user.id,
      email: user.email,
      username: user.username,
      auth_user_id: user.auth_user_id,
      role: user.role
    };
  } catch (error) {
    console.error('Error getting user by ID:', error);
    return null;
  }
}