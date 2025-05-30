import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const userData = req.body.data?.[0];

  if (!userData || !userData.user_id || !userData.email || !userData.name) {
    return res.status(400).json({ error: 'Missing required fields: user_id, email, or name' });
  }

  try {
    const kickId = userData.user_id.toString();
    const username = userData.name;

    // 🔁 Upsert User
    let user = await prisma.user.findUnique({ where: { kickId } });

    if (user) {
      user = await prisma.user.update({
        where: { kickId },
        data: {
          email: userData.email,
          username,
          updatedAt: new Date(),
          ...(userData.refresh_token && { refresh_token: userData.refresh_token }),
        },
      });
    } else {
      user = await prisma.user.create({
        data: {
          kickId,
          email: userData.email,
          username,
          tokens: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
          ...(userData.refresh_token && { refresh_token: userData.refresh_token }),
        },
      });
    }

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
    return res.status(500).json({ error: 'Error saving user info' });
  }
}