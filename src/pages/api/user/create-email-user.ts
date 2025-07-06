import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../../lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { auth_user_id, email } = req.body;

    if (!auth_user_id || !email) {
      return res.status(400).json({ error: "Missing auth_user_id or email" });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        auth_user_id: auth_user_id,
      },
    });

    if (existingUser) {
      return res.status(200).json({ 
        success: true, 
        user: existingUser 
      });
    }

    // Create new user record for email-based authentication
    const newUser = await prisma.user.create({
      data: {
        auth_user_id: auth_user_id,
        email: email,
        username: email.split("@")[0] || "user",
        tokens: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    return res.status(200).json({ 
      success: true, 
      user: newUser 
    });

  } catch (error) {
    console.error("Error creating email user:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}