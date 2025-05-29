// pages/api/botrix.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from '../../../lib/prisma';

// Simple in-memory cache
let lastUpdate: number | null = null;
const CACHE_DURATION_MS = 1000 * 60 * 30;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const now = Date.now();

  if (lastUpdate && now - lastUpdate < CACHE_DURATION_MS) {
    return res.status(200).json({ message: "Using cached data" });
  }

  const url = process.env.BASE_BOTRIX_API_URL!;

  try {
    const response = await fetch(url);
    const data = await response.json();

    for (const user of data) {
      const username = user.name;

      const matchedUser = await prisma.user.findFirst({
        where: { username },
      });

      let kickIdToSet: string | null = null;

      if (matchedUser) {
        const kickIdUsed = await prisma.userData.findUnique({
          where: { kickId: matchedUser.kickId },
        });

        if (!kickIdUsed) {
          kickIdToSet = matchedUser.kickId;
        }
      }

      const existingUserData = await prisma.userData.findFirst({
        where: { username },
      });

      if (existingUserData) {
        await prisma.userData.update({
          where: { id: existingUserData.id },
          data: {
            level: user.level,
            watchtime: user.watchtime,
            xp: user.xp,
            points: user.points,
            followage: user.followage.date,
            ...(existingUserData.kickId === "" && kickIdToSet ? { kickId: kickIdToSet } : {}),
          },
        });
      } else {
        await prisma.userData.create({
          data: {
            username,
            level: user.level,
            watchtime: user.watchtime,
            xp: user.xp,
            points: user.points,
            followage: user.followage.date,
            ...(kickIdToSet ? { kickId: kickIdToSet } : {}),
            converted_tokens: 0,
            token_balance: 0,
          },
        });
      }
    }

    lastUpdate = now;

    res.status(200).json({ message: "UserData synced from Botrix API" });
  } catch (error) {
    console.error("Error syncing Botrix data:", error);
    res.status(500).json({ error: "Failed to sync data" });
  }
}
