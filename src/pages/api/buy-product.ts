import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';
import { parse } from 'cookie';
import { Decimal } from '@prisma/client/runtime/library';
import { standardRateLimit } from '../../../lib/rateLimiter';
import { createAuditLog } from '../../../lib/auditLogger';

async function buyProductHandler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const cookies = parse(req.headers.cookie || '');
  const accessToken = cookies.access_token;
  if (!accessToken) return res.status(401).json({ error: 'Unauthorized' });

  const { productId, quantity } = req.body;
  const qty = parseInt(quantity);
  if (!productId || isNaN(qty) || qty < 1) {
    return res.status(400).json({ error: 'Invalid product or quantity' });
  }

  try {
    // Get Kick user ID
    const userInfo = await fetch('https://api.kick.com/public/v1/users', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const userData = await userInfo.json();
    const kickId = userData?.data?.[0]?.user_id?.toString();

    if (!kickId) return res.status(401).json({ error: 'Invalid Kick user' });

    // Use transaction for atomicity
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({ where: { kickId } });
      const product = await tx.product.findUnique({ where: { id: productId } });
      
      if (!user || !product || !product.active) {
        throw new Error('User or product not found');
      }

      const total = product.price * qty;
      const totalDecimal = new Decimal(total);
      
      if (user.tokens.lessThan(totalDecimal)) {
        throw new Error('Not enough tokens');
      }

      const balanceBefore = user.tokens;
      const balanceAfter = balanceBefore.minus(totalDecimal);

      // Update user balance
      await tx.user.update({
        where: { id: user.id },
        data: { tokens: balanceAfter },
      });

      // Create order
      const order = await tx.order.create({
        data: {
          userId: user.id,
          productId: product.id,
          quantity: qty,
          total,
        },
      });

      // Create audit log
      await createAuditLog(tx, {
        userId: user.id,
        transactionType: 'purchase',
        amount: totalDecimal,
        balanceBefore: balanceBefore,
        balanceAfter: balanceAfter,
        metadata: {
          orderId: order.id,
          productId: product.id,
          productName: product.name,
          quantity: qty,
          pricePerUnit: product.price,
        },
        req,
      });

      return {
        success: true,
        orderId: order.id,
        product: {
          id: product.id,
          name: product.name,
          quantity: qty,
        },
      };
    });

    return res.status(200).json(result);
  } catch (err) {
    console.error('Buy error:', err);
    const errorMessage = err instanceof Error ? err.message : 'Something went wrong';
    
    if (errorMessage === 'Not enough tokens') {
      return res.status(400).json({ error: errorMessage });
    }
    
    if (errorMessage === 'User or product not found') {
      return res.status(404).json({ error: errorMessage });
    }
    
    return res.status(500).json({ error: 'Something went wrong' });
  }
}

// Apply rate limiting
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Check rate limit
  if (!standardRateLimit(req, res)) {
    return; // Response already sent by rate limiter
  }
  
  // Proceed with the handler
  await buyProductHandler(req, res);
}