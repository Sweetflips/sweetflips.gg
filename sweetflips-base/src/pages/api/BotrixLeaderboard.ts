// pages/api/leaderboard.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from '../../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const topUsers = await prisma.userData.findMany({
      orderBy: { points: "desc" },
      take: 10,
      select: {
        id: true,
        username: true,
        points: true,
      },
    });

    res.status(200).json(topUsers);
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    res.status(500).json({ error: "Failed to fetch leaderboard" });
  }
}