import { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";
import { prisma } from "../../../../lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { auth_user_id } = req.query;

    if (!auth_user_id || typeof auth_user_id !== "string") {
      return res.status(400).json({ error: "Missing auth_user_id parameter" });
    }

    // Check if user exists in our database and has Kick linked
    const existingUser = await prisma.user.findFirst({
      where: {
        auth_user_id: auth_user_id,
      },
    });

    if (!existingUser) {
      return res.status(200).json({ 
        isLinked: false,
        shouldShowModal: true,
        user: null
      });
    }

    return res.status(200).json({ 
      isLinked: !!existingUser.kickId,
      shouldShowModal: !existingUser.kickId,
      user: {
        id: existingUser.id,
        email: existingUser.email,
        username: existingUser.username,
        kickId: existingUser.kickId,
        tokens: existingUser.tokens,
      }
    });

  } catch (error) {
    console.error("Error checking link status:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}