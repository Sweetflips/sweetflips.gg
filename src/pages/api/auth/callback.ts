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

  // Parse state to handle both regular auth and account linking
  let sessionId: string;
  let action: string = "login";
  let auth_user_id: string | null = null;

  try {
    const stateData = JSON.parse(state);
    sessionId = stateData.sessionId;
    action = stateData.action || "login";
    auth_user_id = stateData.auth_user_id || null;
  } catch {
    // Fallback for old format (plain sessionId)
    sessionId = state;
  }

  // Fetch code_verifier from DB using session ID
  const session = await prisma.oAuthSession.findUnique({
    where: { id: sessionId },
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

    // Handle account linking vs regular login
    if (action === "link" && auth_user_id) {
      // Link Kick account to existing email-based user
      await handleAccountLinking(auth_user_id, kickUser, refreshToken);
    } else {
      // Regular Kick login - save user to DB via internal API
      const saveRes = await fetch(`${baseUrl}/api/save-user`, {
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
    await prisma.oAuthSession.delete({ where: { id: sessionId } });

    // Redirect based on action
    if (action === "link") {
      return res.redirect("/?linked=success");
    } else {
      return res.redirect("/");
    }
  } catch (error) {
    console.error("Callback error:", error);
    return res.status(500).json({ error: "OAuth callback failed" });
  }
}

async function handleAccountLinking(
  auth_user_id: string,
  kickUser: any,
  refreshToken: string
) {
  // Check if Kick account is already linked to another user
  const existingKickUser = await prisma.user.findUnique({
    where: { kickId: kickUser.user_id.toString() },
  });

  if (existingKickUser && existingKickUser.auth_user_id !== auth_user_id) {
    throw new Error("Kick account is already linked to another user");
  }

  // Find the email-based user
  const emailUser = await prisma.user.findFirst({
    where: { auth_user_id: auth_user_id },
  });

  if (!emailUser) {
    throw new Error("Email-based user not found");
  }

  if (existingKickUser) {
    // Merge accounts: Move data from Kick-only account to email-based account
    await mergeUserAccounts(emailUser, existingKickUser, kickUser, refreshToken);
  } else {
    // Simply link the Kick account to the email-based user
    await prisma.user.update({
      where: { id: emailUser.id },
      data: {
        kickId: kickUser.user_id.toString(),
        refresh_token: refreshToken,
        kick_linked_at: new Date(),
        // Update username if it wasn't set
        username: emailUser.username || kickUser.name,
      },
    });

    // Create or update UserData for the Kick account
    await prisma.userData.upsert({
      where: { kickId: kickUser.user_id.toString() },
      update: {
        username: kickUser.name,
        level: kickUser.level || 0,
        watchtime: kickUser.watchtime || 0,
        xp: kickUser.xp || 0,
        points: kickUser.points || 0,
        followage: kickUser.followage || "0",
        converted_tokens: kickUser.converted_tokens || 0,
        token_balance: kickUser.token_balance || 0,
      },
      create: {
        username: kickUser.name,
        level: kickUser.level || 0,
        kickId: kickUser.user_id.toString(),
        watchtime: kickUser.watchtime || 0,
        xp: kickUser.xp || 0,
        points: kickUser.points || 0,
        followage: kickUser.followage || "0",
        converted_tokens: kickUser.converted_tokens || 0,
        token_balance: kickUser.token_balance || 0,
      },
    });
  }
}

async function mergeUserAccounts(
  emailUser: any,
  kickUser: any,
  kickUserData: any,
  refreshToken: string
) {
  // Start transaction
  await prisma.$transaction(async (tx) => {
    // Update email-based user with Kick data
    await tx.user.update({
      where: { id: emailUser.id },
      data: {
        kickId: kickUserData.user_id.toString(),
        refresh_token: refreshToken,
        kick_linked_at: new Date(),
        // Merge tokens (add them together)
        tokens: emailUser.tokens.add(kickUser.tokens),
        // Update username if it wasn't set
        username: emailUser.username || kickUserData.name,
      },
    });

    // Transfer orders from Kick-only account to email-based account
    await tx.order.updateMany({
      where: { userId: kickUser.id },
      data: { userId: emailUser.id },
    });

    // Remove the old Kick-only user record
    await tx.user.delete({
      where: { id: kickUser.id },
    });

    // Update UserData
    await tx.userData.upsert({
      where: { kickId: kickUserData.user_id.toString() },
      update: {
        username: kickUserData.name,
        level: kickUserData.level || 0,
        watchtime: kickUserData.watchtime || 0,
        xp: kickUserData.xp || 0,
        points: kickUserData.points || 0,
        followage: kickUserData.followage || "0",
        converted_tokens: kickUserData.converted_tokens || 0,
        token_balance: kickUserData.token_balance || 0,
      },
      create: {
        username: kickUserData.name,
        level: kickUserData.level || 0,
        kickId: kickUserData.user_id.toString(),
        watchtime: kickUserData.watchtime || 0,
        xp: kickUserData.xp || 0,
        points: kickUserData.points || 0,
        followage: kickUserData.followage || "0",
        converted_tokens: kickUserData.converted_tokens || 0,
        token_balance: kickUserData.token_balance || 0,
      },
    });
  });
}
