import type { NextApiRequest, NextApiResponse } from 'next';
import { parse } from 'cookie';
import { prisma } from '../../../../lib/prisma';
import { Decimal } from '@prisma/client/runtime/library';
import { plinkoRateLimit } from '../../../../lib/rateLimiter';
import { createAuditLog } from '../../../../lib/auditLogger';
import { createGameSession } from '../../../../lib/plinkoValidator';

async function plinkoSpendHandler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', process.env.PLINKO_URL || '');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-plinko-secret');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    return res.status(200).end();
  }

  res.setHeader('Access-Control-Allow-Origin', process.env.PLINKO_URL || '');
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

  const { amount, clientSeed, risk = 'medium' } = req.body;
  if (typeof amount !== 'number' || amount <= 0) {
    return res.status(400).json({ error: 'Invalid bet amount' });
  }
  
  if (!clientSeed || typeof clientSeed !== 'string') {
    return res.status(400).json({ error: 'Client seed is required' });
  }
  
  if (!['low', 'medium', 'high'].includes(risk)) {
    return res.status(400).json({ error: 'Invalid risk level' });
  }

  try {
    // Use transaction to ensure atomicity
    const result = await prisma.$transaction(async (tx) => {
      // Get user with lock
      const user = await tx.user.findUnique({
        where: { kickId },
      });

      if (!user) {
        throw new Error('User not found');
      }

      const amountDecimal = new Decimal(amount);
      
      if (user.tokens.lessThan(amountDecimal)) {
        throw new Error('Insufficient balance');
      }

      const balanceBefore = user.tokens;
      const balanceAfter = balanceBefore.minus(amountDecimal);

      // Update user balance
      await tx.user.update({
        where: { id: user.id },
        data: {
          tokens: balanceAfter,
        },
      });

      // Create game session for validation
      const gameSession = createGameSession(
        kickId,
        amount,
        risk,
        clientSeed
      );

      // Create audit log
      await createAuditLog(tx, {
        userId: user.id,
        transactionType: 'spend',
        amount: amountDecimal,
        balanceBefore: balanceBefore,
        balanceAfter: balanceAfter,
        metadata: {
          game: 'plinko',
          betAmount: amount,
          risk: risk,
          sessionId: gameSession.sessionId,
          serverSeedHash: gameSession.serverSeed, // In production, only store hash
        },
        req,
      });

      return {
        success: true,
        sessionId: gameSession.sessionId,
        serverSeedHash: gameSession.serverSeed, // In production, hash this
      };
    });

    return res.status(200).json(result);
  } catch (error) {
    console.error('Spend error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to process spend';
    
    if (errorMessage === 'Insufficient balance') {
      return res.status(403).json({ error: errorMessage });
    }
    
    return res.status(500).json({ error: errorMessage });
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
  await plinkoSpendHandler(req, res);
}