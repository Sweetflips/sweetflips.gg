import { parse } from 'cookie';
import { prisma } from './prisma';
import { NextApiRequest, NextApiResponse } from 'next';

export async function getUserFromRequest(req: NextApiRequest, res: NextApiResponse) {
  const cookies = parse(req.headers.cookie || '');
  const kickId = cookies.kick_id;

  if (!kickId) {
    return null;
  }

  // Use kickId directly to get the user safely
  const user = await prisma.user.findUnique({
    where: { kickId },
  });

  return user || null;
}