import { NextApiRequest, NextApiResponse } from 'next';
import { parse } from 'cookie';
import { prisma } from '../../../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const cookies = parse(req.headers.cookie || '');
  const kickId = cookies.kick_id;

  if (!kickId) {
    return res.status(401).json({ error: 'Unauthorized – missing Kick ID' });
  }

  try {
    // Step 1: Get current user using kickId
    const user = await prisma.user.findUnique({ where: { kickId } });

    if (!user || !user.username) {
      return res.status(404).json({ error: 'User not found or missing username' });
    }

    const username = user.username;

    // Step 2: Fetch Botrix data using search= query param
    const botrixUrl = `${process.env.BOTRIX_USER_LOOKUP_API}${username}`;
    const response = await fetch(botrixUrl);
    const botrixData = await response.json();

    const results = Array.isArray(botrixData) ? botrixData : [botrixData];

    // Step 3: Loop through entries to update/insert
    for (const entry of results) {
      // Try to find UserData by username
      const existingUserData = await prisma.userData.findFirst({
        where: {
          username: {
            equals: entry.name,
            mode: 'insensitive',
          },
        },
      });

      // Determine kickId to attach if needed
      let kickIdToSet: string | null = null;
      const linkedUser = await prisma.user.findFirst({
        where: {
          username: {
            equals: entry.name,
            mode: 'insensitive',
          },
        },
      });

      if (linkedUser && linkedUser.kickId) {
        const alreadyUsed = await prisma.userData.findUnique({
          where: { kickId: linkedUser.kickId },
        });

        if (!alreadyUsed) {
          kickIdToSet = linkedUser.kickId;
        }
      }

      if (existingUserData) {
        await prisma.userData.update({
          where: { id: existingUserData.id },
          data: {
            level: entry.level,
            watchtime: entry.watchtime,
            xp: entry.xp,
            points: entry.points,
            followage: entry.followage.date,
            ...(existingUserData.kickId === '' && kickIdToSet ? { kickId: kickIdToSet } : {}),
          },
        });
      } else {
        await prisma.userData.create({
          data: {
            username: entry.name,
            level: entry.level,
            watchtime: entry.watchtime,
            xp: entry.xp,
            points: entry.points,
            followage: entry.followage.date,
            kickId: kickIdToSet || '',
            converted_tokens: 0,
            token_balance: 0,
          },
        });
      }
    }

    return res.status(200).json({ message: 'Botrix data synced successfully' });
  } catch (error) {
    console.error('Botrix sync error:', error);
    return res.status(500).json({ error: 'Failed to sync Botrix data' });
  }
}