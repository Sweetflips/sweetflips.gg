import { NextApiRequest, NextApiResponse } from 'next';
import { parse } from 'cookie';
import { prisma } from '../../../../lib/prisma';
import { Decimal } from '@prisma/client/runtime/library';
import { plinkoRateLimit } from '../../../../lib/rateLimiter';
import { createAuditLog } from '../../../../lib/auditLogger';
import { validateAndCalculatePayout, deleteGameSession } from '../../../../lib/plinkoValidator';

async function plinkoPayoutHandler(req: NextApiRequest, res: NextApiResponse) {
  const allowedOrigin = process.env.PLINKO_URL;

  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', allowedOrigin || '');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-plinko-secret');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    return res.status(200).end();
  }

  res.setHeader('Access-Control-Allow-Origin', allowedOrigin || '');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (req.headers['x-plinko-secret'] !== process.env.PLINKO_SECRET_TOKEN) {
    return res.status(401).json({ error: 'Invalid secret token' });
  }

  const cookies = parse(req.headers.cookie || '');
  const accessToken = cookies.access_token;
  const kickId = cookies.kick_id;

  if (!accessToken || !kickId) {
    return res.status(401).json({ error: 'Unauthorized – missing token or user ID' });
  }

  const { sessionId } = req.body;
  
  if (!sessionId || typeof sessionId !== 'string') {
    return res.status(400).json({ error: 'Session ID is required' });
  }

  try {
    // Validate game outcome
    const validation = validateAndCalculatePayout(sessionId, kickId);
    
    if (!validation.valid) {
      return res.status(400).json({ error: validation.error });
    }

    const payout = validation.payout!;

    // Process payout in transaction
    await prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({
        where: { kickId },
      });

      if (!user) {
        throw new Error('User not found');
      }

      const balanceBefore = user.tokens;
      const balanceAfter = balanceBefore.add(new Decimal(payout));

      // Update user balance
      await tx.user.update({
        where: { id: user.id },
        data: {
          tokens: balanceAfter,
        },
      });

      // Create audit log
      await createAuditLog(tx, {
        userId: user.id,
        transactionType: 'payout',
        amount: new Decimal(payout),
        balanceBefore: balanceBefore,
        balanceAfter: balanceAfter,
        metadata: {
          game: 'plinko',
          sessionId: sessionId,
          position: validation.position,
          payout: payout,
        },
        req,
      });
    });

    // Clean up game session
    deleteGameSession(sessionId);

    return res.status(200).json({ 
      success: true,
      position: validation.position,
      payout: payout,
    });
  } catch (error) {
    console.error('Payout error:', error);
    return res.status(500).json({ error: 'Failed to process payout' });
  }
}

// Apply rate limiting
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Set CORS headers for all requests
  res.setHeader('Access-Control-Allow-Origin', process.env.PLINKO_URL || '');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  
  // Handle OPTIONS request before rate limiting
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-plinko-secret');
    return res.status(200).end();
  }
  
  // Check rate limit
  if (!plinkoRateLimit(req, res)) {
    return; // Response already sent by rate limiter, but CORS headers are now set
  }
  
  // Proceed with the handler
  await plinkoPayoutHandler(req, res);
}