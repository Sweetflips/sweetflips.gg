// pages/api/cron/giveaway-counter-update.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../../lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Verify the request is from Vercel Cron
  const authHeader = req.headers.authorization;
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    // Random increment between 3000 and 7000
    const min = 3000;
    const max = 7000;
    const randomIncrement = Math.random() * (max - min) + min;

    const updated = await prisma.giveawayCounter.update({
      where: { id: 1 },
      data: {
        amount: {
          increment: Math.round(randomIncrement),
        },
      },
    });

    return res.status(200).json({ amount: updated.amount });
  } catch (error) {
    console.error("Error updating giveaway counter:", error);
    return res.status(500).json({ error: "Failed to update counter" });
  }
}