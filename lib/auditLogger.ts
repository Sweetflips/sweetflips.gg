import { Decimal, Prisma } from '@prisma/client';
import { NextApiRequest } from 'next';

export type TransactionType = 'convert' | 'spend' | 'payout' | 'admin_adjustment' | 'purchase';

export interface AuditLogOptions {
  userId: number;
  transactionType: TransactionType;
  amount: Decimal | number;
  balanceBefore: Decimal | number;
  balanceAfter: Decimal | number;
  metadata?: Record<string, any>;
  req?: NextApiRequest;
}

// Type that works with both PrismaClient and transaction context
type PrismaTransactionClient = {
  tokenTransaction: {
    create: (args: any) => Promise<any>;
    findMany: (args: any) => Promise<any>;
    count: (args: any) => Promise<number>;
  };
};

export async function createAuditLog(
  prisma: PrismaTransactionClient,
  options: AuditLogOptions
): Promise<void> {
  const {
    userId,
    transactionType,
    amount,
    balanceBefore,
    balanceAfter,
    metadata,
    req
  } = options;

  // Extract IP and user agent from request if provided
  let ipAddress: string | null = null;
  let userAgent: string | null = null;

  if (req) {
    const forwardedFor = req.headers['x-forwarded-for'];
    ipAddress = typeof forwardedFor === 'string' 
      ? forwardedFor.split(',')[0] 
      : req.socket?.remoteAddress || null;
    userAgent = req.headers['user-agent'] || null;
  }

  try {
    await prisma.tokenTransaction.create({
      data: {
        userId,
        transactionType,
        amount: new Decimal(amount.toString()),
        balanceBefore: new Decimal(balanceBefore.toString()),
        balanceAfter: new Decimal(balanceAfter.toString()),
        metadata: metadata || undefined,
        ipAddress,
        userAgent,
      },
    });
  } catch (error) {
    // Log error but don't fail the main transaction
    console.error('Failed to create audit log:', error);
  }
}

// Helper to get user's recent transactions
export async function getUserTransactionHistory(
  prisma: PrismaTransactionClient,
  userId: number,
  limit: number = 50
) {
  return await prisma.tokenTransaction.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: limit,
    include: {
      user: {
        select: {
          username: true,
          email: true,
        },
      },
    },
  });
}

// Helper to detect suspicious activity
export async function checkSuspiciousActivity(
  prisma: PrismaTransactionClient,
  userId: number,
  transactionType: TransactionType,
  amount: number
): Promise<{ suspicious: boolean; reason?: string }> {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  
  // Get recent transactions
  const recentTransactions = await prisma.tokenTransaction.findMany({
    where: {
      userId,
      createdAt: { gte: oneHourAgo },
    },
    orderBy: { createdAt: 'desc' },
  });

  // Check for rapid transactions (more than 10 in last hour)
  if (recentTransactions.length > 10) {
    return { 
      suspicious: true, 
      reason: 'Too many transactions in the last hour' 
    };
  }

  // Check for unusual large transactions
  if (transactionType === 'convert' && amount > 10000) {
    return { 
      suspicious: true, 
      reason: 'Unusually large conversion amount' 
    };
  }

  // Check for repeated identical transactions
  const identicalTransactions = recentTransactions.filter(
    (t: any) => t.transactionType === transactionType && 
        new Decimal(t.amount).equals(amount)
  );
  
  if (identicalTransactions.length > 3) {
    return { 
      suspicious: true, 
      reason: 'Multiple identical transactions detected' 
    };
  }

  return { suspicious: false };
}