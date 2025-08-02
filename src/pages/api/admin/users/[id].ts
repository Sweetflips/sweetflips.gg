// pages/api/admin/users/[id].ts
import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../../../lib/prisma';
import { parse } from 'cookie';
import { adminRateLimit } from '../../../../../lib/rateLimiter';
import { createAuditLog } from '../../../../../lib/auditLogger';
import { Decimal } from '@prisma/client/runtime/library';

async function adminUserHandler(req: NextApiRequest, res: NextApiResponse) {
  const {
    query: { id },
    method,
  } = req;

  const cookies = parse(req.headers.cookie || '');
  const accessToken = cookies.access_token;

  if (!accessToken) return res.status(401).json({ error: 'Unauthorized' });

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

  if (method === 'PUT') {
    try {
      const { username, email, tokens, role } = req.body;
      
      // Use transaction for audit logging
      const updated = await prisma.$transaction(async (tx) => {
        // Get current user state
        const currentUser = await tx.user.findUnique({
          where: { id: Number(id) },
        });
        
        if (!currentUser) {
          throw new Error('User not found');
        }
        
        const newTokens = new Decimal(tokens);
        const tokensDiff = newTokens.minus(currentUser.tokens);
        
        // Update user
        const updatedUser = await tx.user.update({
          where: { id: Number(id) },
          data: {
            username,
            email,
            tokens: newTokens,
            role,
          },
        });
        
        // Create audit log if tokens were changed
        if (!tokensDiff.equals(0)) {
          await createAuditLog(tx, {
            userId: currentUser.id,
            transactionType: 'admin_adjustment',
            amount: tokensDiff.abs(),
            balanceBefore: currentUser.tokens,
            balanceAfter: newTokens,
            metadata: {
              adminId: requestingUser.id,
              adminKickId: kickId,
              adjustmentType: tokensDiff.greaterThan(0) ? 'credit' : 'debit',
              previousValues: {
                username: currentUser.username,
                email: currentUser.email,
                role: currentUser.role,
              },
              newValues: {
                username,
                email,
                role,
              },
            },
            req,
          });
        }
        
        return updatedUser;
      });

      return res.status(200).json(updated);
    } catch (error) {
      console.error('Admin update error:', error);
      return res.status(500).json({ error: 'Failed to update user' });
    }
  }

  if (method === 'DELETE') {
    try {
      await prisma.user.delete({
        where: { id: Number(id) },
      });

      return res.status(204).end();
    } catch (error) {
      return res.status(500).json({ error: 'Failed to delete user' });
    }
  }

  res.setHeader('Allow', ['PUT', 'DELETE']);
  res.status(405).end(`Method ${method} Not Allowed`);
}

// Apply rate limiting
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Check rate limit
  if (!adminRateLimit(req, res)) {
    return; // Response already sent by rate limiter
  }
  
  // Proceed with the handler
  await adminUserHandler(req, res);
}