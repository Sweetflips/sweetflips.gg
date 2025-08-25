import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Enable CORS for Unity WebGL
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Authorization, Content-Type");

  // Handle preflight request
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId, avatarProperties } = req.body;

    if (!avatarProperties) {
      return res.status(400).json({ error: 'Missing avatarProperties' });
    }

    // Get auth token from header
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No authorization token provided' });
    }

    const token = authHeader.substring(7);
    console.log('Received token:', token.substring(0, 20) + '...');

    // Verify token with Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      console.error('Token validation failed:', error);
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    console.log('Token validated for user:', user.id);
    const authUserId = user.id;

    // Check if user exists in our database
    let dbUser = await prisma.user.findFirst({
      where: {
        auth_user_id: authUserId
      }
    });

    // If user doesn't exist in our database, create them
    if (!dbUser) {
      console.log('User not found in database, creating new user record');
      dbUser = await prisma.user.create({
        data: {
          email: user.email || `${authUserId}@unity.local`,
          username: user.user_metadata?.username || `unity_user_${Date.now()}`,
          auth_user_id: authUserId,
          tokens: 100, // Give new users some starting tokens
          role: 'user'
        }
      });
      console.log('Created new user:', dbUser.id);
    }

    // Process avatar data
    const processedAssets = avatarProperties.Assets || avatarProperties.assets;
    
    // Create or update avatar using auth_user_id
    const avatar = await prisma.avatar.upsert({
      where: { 
        auth_user_id: authUserId 
      },
      update: {
        avatarId: avatarProperties.Id || avatarProperties.id,
        partner: avatarProperties.Partner || avatarProperties.partner,
        gender: avatarProperties.Gender || avatarProperties.gender,
        bodyType: avatarProperties.BodyType || avatarProperties.bodyType,
        bodyShape: avatarProperties.BodyShape || avatarProperties.bodyShape,
        assets: processedAssets,
        base64Image: avatarProperties.Base64Image || avatarProperties.base64Image,
        avatarUrl: avatarProperties.avatarUrl,
        avatarLink: avatarProperties.avatarLink,
        thumbnailUrl: avatarProperties.thumbnailUrl || avatarProperties.ThumbnailUrl,
        renderPose: avatarProperties.RenderPose || avatarProperties.renderPose,
        expression: avatarProperties.Expression || avatarProperties.expression,
        isDraft: avatarProperties.isDraft !== undefined ? avatarProperties.isDraft : true,
        isPublic: avatarProperties.isPublic !== undefined ? avatarProperties.isPublic : true,
        metadata: avatarProperties.metadata || {},
        userId: dbUser.id // Also link to the public user ID
      },
      create: {
        auth_user_id: authUserId,
        userId: dbUser.id,
        avatarId: avatarProperties.Id || avatarProperties.id,
        partner: avatarProperties.Partner || avatarProperties.partner,
        gender: avatarProperties.Gender || avatarProperties.gender,
        bodyType: avatarProperties.BodyType || avatarProperties.bodyType,
        bodyShape: avatarProperties.BodyShape || avatarProperties.bodyShape,
        assets: processedAssets,
        base64Image: avatarProperties.Base64Image || avatarProperties.base64Image,
        avatarUrl: avatarProperties.avatarUrl,
        avatarLink: avatarProperties.avatarLink,
        thumbnailUrl: avatarProperties.thumbnailUrl || avatarProperties.ThumbnailUrl,
        renderPose: avatarProperties.RenderPose || avatarProperties.renderPose,
        expression: avatarProperties.Expression || avatarProperties.expression,
        isDraft: avatarProperties.isDraft !== undefined ? avatarProperties.isDraft : true,
        isPublic: avatarProperties.isPublic !== undefined ? avatarProperties.isPublic : true,
        metadata: avatarProperties.metadata || {}
      }
    });

    console.log('Avatar saved successfully:', avatar.id);

    res.status(200).json({ 
      success: true, 
      avatar: {
        id: avatar.id,
        avatarId: avatar.avatarId,
        userId: dbUser.id,
        authUserId: authUserId
      }
    });
  } catch (error) {
    console.error('Error uploading avatar:', error);
    res.status(500).json({ 
      error: 'Failed to upload avatar',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}