import { NextApiRequest, NextApiResponse } from 'next';
import { parse } from 'cookie';
import { prisma } from '../../../../lib/prisma';
import { adminRateLimit } from '../../../../lib/rateLimiter';

async function adminTransactionsHandler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const cookies = parse(req.headers.cookie || '');
  const accessToken = cookies.access_token;

  if (!accessToken) return res.status(401).json({ error: 'Unauthorized' });

  // Verify admin access
  const userRes = await fetch('https://api.kick.com/public/v1/users', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  const kickData = await userRes.json();
  const kickId = kickData?.data?.[0]?.user_id?.toString();
  if (!kickId) return res.status(401).json({ error: 'Invalid Kick user' });

  const requestingUser = await prisma.user.findUnique({ where: { kickId } });
  if (!requestingUser || requestingUser.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }

  try {
    // Get query params
    const limit = parseInt(req.query.limit as string) || 50;
    const page = parseInt(req.query.page as string) || 1;
    const offset = (page - 1) * limit;
    const userId = req.query.userId ? parseInt(req.query.userId as string) : undefined;
    const transactionType = req.query.type as string;
    const startDate = req.query.startDate as string;
    const endDate = req.query.endDate as string;

    // Build query
    const where: any = {};
    if (userId) where.userId = userId;
    if (transactionType && ['convert', 'spend', 'payout', 'admin_adjustment', 'purchase'].includes(transactionType)) {
      where.transactionType = transactionType;
    }
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    // Get transactions with user data
    const [transactions, total] = await Promise.all([
      prisma.tokenTransaction.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
        include: {
          user: {
            select: {
              id: true,
              username: true,
              email: true,
              kickId: true,
            },
          },
        },
      }),
      prisma.tokenTransaction.count({ where }),
    ]);

    // Format response
    const formattedTransactions = transactions.map(tx => ({
      id: tx.id,
      user: {
        id: tx.user.id,
        username: tx.user.username,
        email: tx.user.email,
        kickId: tx.user.kickId,
      },
      type: tx.transactionType,
      amount: tx.amount.toNumber(),
      balanceBefore: tx.balanceBefore.toNumber(),
      balanceAfter: tx.balanceAfter.toNumber(),
      metadata: tx.metadata,
      ipAddress: tx.ipAddress,
      userAgent: tx.userAgent,
      createdAt: tx.createdAt.toISOString(),
    }));

    // Get summary statistics
    const stats = await prisma.tokenTransaction.groupBy({
      by: ['transactionType'],
      where,
      _sum: {
        amount: true,
      },
      _count: true,
    });

    return res.status(200).json({
      transactions: formattedTransactions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      stats: stats.map(s => ({
        type: s.transactionType,
        count: s._count,
        totalAmount: s._sum.amount?.toNumber() || 0,
      })),
    });
  } catch (error) {
    console.error('Admin transactions error:', error);
    return res.status(500).json({ error: 'Failed to fetch transactions' });
  }
}

// Apply rate limiting
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Check rate limit
  if (!adminRateLimit(req, res)) {
    return; // Response already sent by rate limiter
  }
  
  // Proceed with the handler
  await adminTransactionsHandler(req, res);
}