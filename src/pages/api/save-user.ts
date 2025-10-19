import { NextApiRequest, NextApiResponse } from 'next';
import { Prisma } from '@prisma/client';
import { prisma } from '../../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const userData = req.body.data?.[0];

  if (!userData || !userData.user_id || !userData.email || !userData.name) {
    return res.status(400).json({ error: 'Missing required fields: user_id, email, or name' });
  }

  const kickId = userData.user_id.toString();
  const username = userData.name;

  try {
    // Concurrency-safe upsert of the Kick user record
    await prisma.user.upsert({
      where: { kickId },
      update: {
        email: userData.email,
        username,
        ...(userData.refresh_token && { refresh_token: userData.refresh_token }),
      },
      create: {
        kickId,
        email: userData.email,
        username,
        tokens: new Prisma.Decimal(0),
        ...(userData.refresh_token && { refresh_token: userData.refresh_token }),
      },
    });

    const userDataMatch = await prisma.userData.findMany({
      where: {
        username,
        kickId: null,
      },
    });

    if (userDataMatch.length === 1) {
      await prisma.userData.update({
        where: { id: userDataMatch[0].id },
        data: {
          kickId,
          updatedAt: new Date(),
        },
      });

      console.log(`✔️ Linked kickId ${kickId} to existing UserData record for ${username}`);
    }

    return res.status(200).json({ success: true, username, kickId });
  } catch (error) {
    console.error('Error saving user info:', error);
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      const target = error.meta?.target;
      if (
        error.code === 'P2002' &&
        ((Array.isArray(target) && target.includes('kickId')) || target === 'kickId')
      ) {
        // Duplicate kickId means the user already exists; treat as success to unblock login
        return res.status(200).json({ success: true, username, kickId });
      }
    }
    return res.status(500).json({ error: 'Error saving user info' });
  }
}
