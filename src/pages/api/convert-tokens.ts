import { NextApiRequest, NextApiResponse } from 'next';
import { parse } from 'cookie';
import { prisma } from '../../../lib/prisma';
import { Decimal } from '@prisma/client/runtime/library';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const cookies = parse(req.headers.cookie || '');
  const kickId = cookies.kick_id;

  if (!kickId) {
    return res.status(401).json({ error: 'Unauthorized – missing Kick ID' });
  }

  const { amount } = req.body;
  const parsedAmount = parseInt(amount);

  if (!parsedAmount || parsedAmount < 1) {
    return res.status(400).json({ error: 'Invalid amount' });
  }

  // Find user and userdata
  const user = await prisma.user.findUnique({ where: { kickId } });
  const userData = await prisma.userData.findUnique({ where: { kickId } });

  if (!user || !userData) {
    return res.status(404).json({ error: 'User or user data not found' });
  }

  // Load conversion rate
  const tokenSettings = await prisma.tokenSettings.findFirst();
  const conversionRate = tokenSettings?.conversionRate || 100;

  const availablePoints = userData.points - userData.converted_tokens;
  const tokensToAdd = new Decimal(parsedAmount).div(conversionRate).toDecimalPlaces(2);

  if (tokensToAdd.lessThan(0.01)) {
    return res.status(400).json({
      error: `You must convert at least ${conversionRate} points to get 1 token.`,
    });
  }

  if (parsedAmount > availablePoints) {
    return res.status(400).json({ error: 'Not enough points to convert.' });
  }

  // Perform DB update transaction
  await prisma.$transaction([
    prisma.userData.update({
      where: { id: userData.id },
      data: {
        converted_tokens: {
          increment: parsedAmount,
        },
      },
    }),
    prisma.user.update({
      where: { id: user.id },
      data: {
        tokens: {
          increment: tokensToAdd,
        },
      },
    }),
  ]);

  return res.status(200).json({
    success: true,
    converted: parsedAmount,
    tokensAdded: tokensToAdd.toNumber(),
  });
}