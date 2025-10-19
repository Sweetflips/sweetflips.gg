import { NextApiRequest, NextApiResponse } from 'next';

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

// In-memory store for rate limiting (consider using Redis in production)
const rateLimitStore: RateLimitStore = {};

// Clean up expired entries every 5 minutes
let cleanupInterval: NodeJS.Timeout | null = null;
if (typeof setInterval !== 'undefined') {
  cleanupInterval = setInterval(() => {
    try {
      const now = Date.now();
      Object.keys(rateLimitStore).forEach(key => {
        if (rateLimitStore[key] && rateLimitStore[key].resetTime < now) {
          delete rateLimitStore[key];
        }
      });
    } catch (error) {
      console.error('Rate limiter cleanup error:', error);
    }
  }, 5 * 60 * 1000);
}

// Cleanup on process exit
if (typeof process !== 'undefined' && (process as any).on) {
  (process as any).on('exit', () => {
    if (cleanupInterval) {
      clearInterval(cleanupInterval);
    }
  });
}

export interface RateLimitOptions {
  windowMs?: number; // Time window in milliseconds (default: 1 minute)
  maxRequests?: number; // Max requests per window (default: 10)
  keyGenerator?: (req: NextApiRequest) => string; // Function to generate rate limit key
}

export function createRateLimiter(options: RateLimitOptions = {}) {
  const {
    windowMs = 60 * 1000, // 1 minute
    maxRequests = 10,
    keyGenerator = (req) => {
      // Default: use IP + user ID if available
      const forwardedFor = req.headers['x-forwarded-for'];
      const ip = typeof forwardedFor === 'string' 
        ? forwardedFor.split(',')[0] 
        : req.socket?.remoteAddress || 'unknown';
      const userId = req.cookies?.kick_id || 'anonymous';
      return `${ip}:${userId}`;
    },
  } = options;

  return function checkRateLimit(req: NextApiRequest, res: NextApiResponse): boolean {
    try {
      const key = keyGenerator(req);
      const now = Date.now();
      const resetTime = now + windowMs;

      // Initialize or get existing rate limit data
      if (!rateLimitStore[key] || rateLimitStore[key].resetTime < now) {
        rateLimitStore[key] = {
          count: 1,
          resetTime: resetTime,
        };
      } else {
        rateLimitStore[key].count++;
      }

      const rateLimit = rateLimitStore[key];
      const remaining = Math.max(0, maxRequests - rateLimit.count);

      // Set rate limit headers (with error handling)
      try {
        res.setHeader('X-RateLimit-Limit', maxRequests.toString());
        res.setHeader('X-RateLimit-Remaining', remaining.toString());
        res.setHeader('X-RateLimit-Reset', new Date(rateLimit.resetTime).toISOString());
      } catch (headerError) {
        // Headers might already be sent
        console.warn('Failed to set rate limit headers:', headerError);
      }

      // Check if limit exceeded
      if (rateLimit.count > maxRequests) {
        const retryAfter = Math.ceil((rateLimit.resetTime - now) / 1000);
        
        try {
          res.setHeader('Retry-After', retryAfter.toString());
        } catch (headerError) {
          console.warn('Failed to set Retry-After header:', headerError);
        }
        
        res.status(429).json({
          error: 'Too many requests',
          retryAfter: retryAfter,
          message: `Rate limit exceeded. Please try again in ${retryAfter} seconds.`
        });
        
        return false; // Rate limit exceeded
      }

      return true; // Rate limit OK
    } catch (error) {
      // In case of any error, log it but allow the request to proceed
      console.error('Rate limiter error:', error);
      return true; // Allow request on error
    }
  };
}

// Pre-configured rate limiters for different use cases
export const strictRateLimit = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 5,
});

export const standardRateLimit = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 20,
});

export const relaxedRateLimit = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 60,
});

// Token conversion specific rate limiter
export const tokenConversionRateLimit = createRateLimiter({
  windowMs: 5 * 60 * 1000, // 5 minutes
  maxRequests: 3, // Max 3 conversions per 5 minutes
});

// Admin operations rate limiter
export const adminRateLimit = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 30,
  keyGenerator: (req) => {
    // For admin, rate limit by user ID only
    return req.cookies?.kick_id || 'anonymous';
  }
});

// Plinko game rate limiter - more permissive for gameplay
export const plinkoRateLimit = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 30, // Allow 30 bets per minute (1 every 2 seconds on average)
  keyGenerator: (req) => {
    // Rate limit by user ID primarily to prevent individual abuse
    return req.cookies?.kick_id || req.socket?.remoteAddress || 'anonymous';
  }
});