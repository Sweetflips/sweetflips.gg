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

  console.log(`[convert-tokens] Received request with kickId: ${kickId}`);

  if (!kickId) {
    console.log('[convert-tokens] Unauthorized: Missing Kick ID');
    return res.status(401).json({ error: 'Unauthorized – missing Kick ID' });
  }

  const { amount } = req.body;
  const parsedAmount = parseInt(amount);

  if (!parsedAmount || parsedAmount < 1) {
    return res.status(400).json({ error: 'Invalid amount' });
  }

  // Find user and userdata
  const user = await prisma.user.findUnique({ where: { kickId } });
  console.log(`[convert-tokens] User record found for kickId ${kickId}: ${!!user}`);

  const userData = await prisma.userData.findUnique({ where: { kickId } });
  console.log(`[convert-tokens] UserData record found for kickId ${kickId}: ${!!userData}`);

  if (!user || !userData) {
    console.log(`[convert-tokens] User or userData not found for kickId ${kickId}. User: ${!!user}, UserData: ${!!userData}`);
    return res.status(404).json({ error: 'User or user data not found' });
  }

  // Load conversion rate
  const tokenSettings = await prisma.tokenSettings.findFirst();
  const conversionRate = tokenSettings?.conversionRate || 100;

  const availablePoints = userData.points - userData.converted_tokens;
  console.log(`[convert-tokens] For kickId ${kickId}: availablePoints = ${availablePoints} (points: ${userData.points}, converted_tokens: ${userData.converted_tokens})`);

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