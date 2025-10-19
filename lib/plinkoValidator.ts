import crypto from 'crypto';

// Plinko game configuration
const PLINKO_CONFIG = {
  rows: 16,
  risk: {
    low: {
      multipliers: [
        5.6, 2.1, 1.1, 1, 0.5, 1, 0.5, 1, 0.5, 1, 0.5, 1, 1.1, 2.1, 5.6
      ]
    },
    medium: {
      multipliers: [
        13, 3, 1.3, 0.7, 0.4, 0.7, 0.4, 0.7, 0.4, 0.7, 0.4, 0.7, 1.3, 3, 13
      ]
    },
    high: {
      multipliers: [
        29, 4, 1.5, 0.3, 0.2, 0.3, 0.2, 0.3, 0.2, 0.3, 0.2, 0.3, 1.5, 4, 29
      ]
    }
  }
};

export interface PlinkoGameSession {
  sessionId: string;
  userId: string;
  betAmount: number;
  risk: 'low' | 'medium' | 'high';
  serverSeed: string;
  clientSeed: string;
  nonce: number;
  createdAt: Date;
  expiresAt: Date;
}

/**
 * WARNING: This in-memory session store will NOT work properly in serverless environments
 * or with multiple server instances. In production, you should use:
 * - Redis for session storage
 * - Database table for session persistence
 * - Distributed cache solution
 * 
 * Current implementation is for development/single-instance deployments only.
 */
const gameSessions = new Map<string, PlinkoGameSession>();

// Clean up expired sessions every 5 minutes
// Note: In serverless, this interval won't persist between invocations
let cleanupInterval: NodeJS.Timeout | null = null;
if (typeof setInterval !== 'undefined' && process.env.NODE_ENV !== 'production') {
  cleanupInterval = setInterval(() => {
    const now = new Date();
    // Use forEach instead of for...of to avoid TypeScript compatibility issues
    gameSessions.forEach((session, sessionId) => {
      if (session.expiresAt < now) {
        gameSessions.delete(sessionId);
      }
    });
  }, 5 * 60 * 1000);
}

// Cleanup on process exit (for non-serverless environments)
if (typeof process !== 'undefined' && (process as any).on) {
  (process as any).on('exit', () => {
    if (cleanupInterval) {
      clearInterval(cleanupInterval);
    }
  });
}

export function createGameSession(
  userId: string,
  betAmount: number,
  risk: 'low' | 'medium' | 'high',
  clientSeed: string
): PlinkoGameSession {
  const sessionId = crypto.randomUUID();
  const serverSeed = crypto.randomBytes(32).toString('hex');
  
  const session: PlinkoGameSession = {
    sessionId,
    userId,
    betAmount,
    risk,
    serverSeed,
    clientSeed,
    nonce: 0,
    createdAt: new Date(),
    expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minute expiry
  };
  
  gameSessions.set(sessionId, session);
  return session;
}

export function getGameSession(sessionId: string): PlinkoGameSession | null {
  const session = gameSessions.get(sessionId);
  if (!session) return null;
  
  // Check if expired
  if (session.expiresAt < new Date()) {
    gameSessions.delete(sessionId);
    return null;
  }
  
  return session;
}

export function deleteGameSession(sessionId: string): void {
  gameSessions.delete(sessionId);
}

// Provably fair outcome calculation
export function calculateOutcome(
  serverSeed: string,
  clientSeed: string,
  nonce: number
): number {
  const hash = crypto
    .createHmac('sha256', serverSeed)
    .update(`${clientSeed}:${nonce}`)
    .digest('hex');
  
  // Extract 4 bytes from hash to get a number between 0 and 1
  const num = parseInt(hash.substring(0, 8), 16);
  const floatNum = num / 0xffffffff;
  
  // For Plinko with 16 rows, calculate final position (0-14)
  let position = 0;
  let currentPosition = 7; // Start in middle
  
  // Simulate ball falling through 16 rows
  for (let row = 0; row < PLINKO_CONFIG.rows; row++) {
    // Extract bit for this row
    const byteIndex = Math.floor(row / 4);
    const bitIndex = (row % 4) * 2;
    const byte = parseInt(hash.substring(byteIndex * 2, byteIndex * 2 + 2), 16);
    const direction = (byte >> bitIndex) & 1;
    
    // Move left (0) or right (1)
    if (direction === 0 && currentPosition > 0) {
      currentPosition--;
    } else if (direction === 1 && currentPosition < 14) {
      currentPosition++;
    }
  }
  
  position = currentPosition;
  return position;
}

export function calculatePayout(
  position: number,
  betAmount: number,
  risk: 'low' | 'medium' | 'high'
): number {
  const multipliers = PLINKO_CONFIG.risk[risk].multipliers;
  const multiplier = multipliers[position];
  return betAmount * multiplier;
}

export interface ValidationResult {
  valid: boolean;
  position?: number;
  payout?: number;
  error?: string;
}

export function validateAndCalculatePayout(
  sessionId: string,
  userId: string
): ValidationResult {
  const session = getGameSession(sessionId);
  
  if (!session) {
    return { valid: false, error: 'Invalid or expired game session' };
  }
  
  if (session.userId !== userId) {
    return { valid: false, error: 'Session does not belong to user' };
  }
  
  // Calculate outcome
  const position = calculateOutcome(
    session.serverSeed,
    session.clientSeed,
    session.nonce
  );
  
  // Calculate payout
  const payout = calculatePayout(position, session.betAmount, session.risk);
  
  // Increment nonce for next game
  session.nonce++;
  
  return {
    valid: true,
    position,
    payout,
  };
}

// Helper to get server seed hash (for client display)
export function getServerSeedHash(serverSeed: string): string {
  return crypto.createHash('sha256').update(serverSeed).digest('hex');
}

// Note: For production deployment on serverless/edge environments,
// consider implementing a database-backed session storage system

// Verify a past game result
export function verifyGameResult(
  serverSeed: string,
  clientSeed: string,
  nonce: number,
  expectedPosition: number
): boolean {
  const calculatedPosition = calculateOutcome(serverSeed, clientSeed, nonce);
  return calculatedPosition === expectedPosition;
}