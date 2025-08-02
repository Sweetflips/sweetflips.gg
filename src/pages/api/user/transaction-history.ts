import { NextApiRequest, NextApiResponse } from 'next';
import { parse } from 'cookie';
import { prisma } from '../../../../lib/prisma';
import { standardRateLimit } from '../../../../lib/rateLimiter';

async function transactionHistoryHandler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const cookies = parse(req.headers.cookie || '');
  const kickId = cookies.kick_id;

  if (!kickId) {
    return res.status(401).json({ error: 'Unauthorized – missing Kick ID' });
  }

  try {
    // Get user
    const user = await prisma.user.findUnique({ where: { kickId } });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get pagination params
    const limit = parseInt(req.query.limit as string) || 50;
    const page = parseInt(req.query.page as string) || 1;
    const offset = (page - 1) * limit;

    // Get transaction type filter
    const transactionType = req.query.type as string;

    // Build query
    const where: any = { userId: user.id };
    if (transactionType && ['convert', 'spend', 'payout', 'admin_adjustment', 'purchase'].includes(transactionType)) {
      where.transactionType = transactionType;
    }

    // Get transactions with pagination
    const [transactions, total] = await Promise.all([
      prisma.tokenTransaction.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
        select: {
          id: true,
          transactionType: true,
          amount: true,
          balanceBefore: true,
          balanceAfter: true,
          metadata: true,
          createdAt: true,
        },
      }),
      prisma.tokenTransaction.count({ where }),
    ]);

    // Format response
    const formattedTransactions = transactions.map(tx => ({
      id: tx.id,
      type: tx.transactionType,
      amount: tx.amount.toNumber(),
      balanceBefore: tx.balanceBefore.toNumber(),
      balanceAfter: tx.balanceAfter.toNumber(),
      metadata: tx.metadata,
      createdAt: tx.createdAt.toISOString(),
    }));

    return res.status(200).json({
      transactions: formattedTransactions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Transaction history error:', error);
    return res.status(500).json({ error: 'Failed to fetch transaction history' });
  }
}

// Apply rate limiting
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Check rate limit
  if (!standardRateLimit(req, res)) {
    return; // Response already sent by rate limiter
  }
  
  // Proceed with the handler
  await transactionHistoryHandler(req, res);
}