import { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";
import { prisma } from "../../../../lib/prisma";
import { v4 as uuidv4 } from "uuid";
import { randomBytes, createHash } from "crypto";

const KICK_CLIENT_ID = process.env.NEXT_PUBLIC_KICK_CLIENT_ID!;
const KICK_CLIENT_SECRET = process.env.KICK_CLIENT_SECRET!;
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://sweetflips.gg";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { auth_user_id } = req.body;

    if (!auth_user_id) {
      return res.status(400).json({ error: "Missing auth_user_id" });
    }

    // Check if user already has a Kick account linked
    const existingUser = await prisma.user.findFirst({
      where: {
        auth_user_id: auth_user_id,
      },
    });

    if (existingUser?.kickId) {
      return res.status(400).json({ error: "Kick account already linked" });
    }

    // Generate OAuth session with PKCE
    const sessionId = uuidv4();
    const codeVerifier = randomBytes(32).toString('base64url');
    const codeChallenge = createHash('sha256').update(codeVerifier).digest('base64url');
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await prisma.oAuthSession.create({
      data: {
        id: sessionId,
        codeVerifier,
        expiresAt,
      },
    });

    // Update user to mark link request initiated
    if (existingUser) {
      await prisma.user.update({
        where: { id: existingUser.id },
        data: { kick_link_requested_at: new Date() },
      });
    }

    // Build Kick OAuth URL with PKCE
    const authUrl = new URL("https://kick.com/oauth/authorize");
    authUrl.searchParams.append("client_id", KICK_CLIENT_ID);
    authUrl.searchParams.append("response_type", "code");
    authUrl.searchParams.append("scope", "user:read");
    authUrl.searchParams.append("redirect_uri", `${BASE_URL}/api/auth/callback`);
    authUrl.searchParams.append("code_challenge", codeChallenge);
    authUrl.searchParams.append("code_challenge_method", "S256");
    authUrl.searchParams.append("state", JSON.stringify({ 
      sessionId, 
      action: "link",
      auth_user_id 
    }));

    return res.status(200).json({ 
      authUrl: authUrl.toString(),
      sessionId 
    });

  } catch (error) {
    console.error("Error initiating Kick account linking:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}