import { NextApiRequest, NextApiResponse } from "next";
import { serialize } from "cookie";
import { prisma } from "../../../../lib/prisma";
import { getBaseUrl } from "../../../../lib/getBaseUrl";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { code, state } = req.query;

  if (!code || !state || typeof state !== "string") {
    return res.status(400).json({ error: "Missing code or state" });
  }

  // Fetch code_verifier from DB using session ID (state)
  const session = await prisma.oAuthSession.findUnique({
    where: { id: state },
  });

  if (!session || new Date() > session.expiresAt) {
    return res.status(400).json({ error: "Invalid or expired session" });
  }

  const codeVerifier = session.codeVerifier;

  const clientId = process.env.NEXT_PUBLIC_KICK_CLIENT_ID!;
  const clientSecret = process.env.KICK_CLIENT_SECRET!;

  let baseUrl = getBaseUrl();

  // Ensure no trailing slash
  if (baseUrl.endsWith("/")) {
    baseUrl = baseUrl.slice(0, -1);
  }

  const redirectUri = `${baseUrl}/api/auth/callback`;

  try {
    // Exchange code for tokens
    const tokenResponse = await fetch("https://id.kick.com/oauth/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri, // Uses the new redirectUri
        code: code as string,
        code_verifier: codeVerifier,
      }),
    });

    const tokenData = await tokenResponse.json();

    if (!tokenData?.access_token) {
      console.error("❌ No access_token returned:", tokenData);
      return res.status(400).json({ error: "Access token missing from Kick" });
    }

    const accessToken = tokenData.access_token;
    const refreshToken = tokenData.refresh_token;

    // Fetch user info from Kick
    const userInfoRes = await fetch("https://api.kick.com/public/v1/users", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!userInfoRes.ok) {
      return res
        .status(400)
        .json({ error: "Failed to fetch user info from Kick" });
    }

    const userInfo = await userInfoRes.json();
    const kickUser = userInfo?.data?.[0];

    if (!kickUser || !kickUser.user_id || !kickUser.name || !kickUser.email) {
      return res.status(400).json({ error: "Incomplete Kick user data" });
    }

    // Save user to DB via internal API
    const saveRes = await fetch(`${baseUrl}/api/save-user`, {
      // Uses the new baseUrl
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        data: [
          {
            ...kickUser,
            refresh_token: refreshToken,
          },
        ],
      }),
    });

    if (!saveRes.ok) {
      const errorText = await saveRes.text();
      console.error("Save-user failed:", errorText);
      return res.status(500).json({ error: "Failed to save user info to DB" });
    }

    // Set secure access_token cookie
    res.setHeader("Set-Cookie", [
      serialize("access_token", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "none",
        maxAge: 60 * 60 * 24,
        path: "/",
      }),
      serialize("kick_id", kickUser.user_id.toString(), {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "none",
        maxAge: 60 * 60 * 24,
        path: "/",
      }),
    ]);

    // Cleanup: delete session
    await prisma.oAuthSession.delete({ where: { id: state } });

    // Redirect to home
    return res.redirect("/");
  } catch (error) {
    console.error("Callback error:", error);
    return res.status(500).json({ error: "OAuth callback failed" });
  }
}
