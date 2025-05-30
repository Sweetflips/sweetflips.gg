// /api/get-user.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient(); // Initialize Prisma Client

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const { kickId } = req.query; // Get kickId from query params

    if (!kickId || typeof kickId !== 'string') {
      return res.status(400).json({ error: 'kickId is required' });
    }

    try {
      // Fetch user from the database using the kickId
      const user = await prisma.user.findUnique({
        where: { kickId: kickId },
      });

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.status(200).json(user); // Return user data
    } catch (error) {
      console.error('Error fetching user data:', error);
      res.status(500).json({ error: 'Error fetching user data' });
    } finally {
      await prisma.$disconnect();
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
