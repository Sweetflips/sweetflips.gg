// lib/prisma.ts
import { PrismaClient } from '../../prisma/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient(): PrismaClient {
  const databaseUrl = process.env.DATABASE_URL || process.env.POSTGRES_PRISMA_URL;

  if (!databaseUrl) {
    throw new Error('DATABASE_URL or POSTGRES_PRISMA_URL must be set');
  }

  const connectionUrl = databaseUrl.includes('sslmode=require') && !databaseUrl.includes('uselibpqcompat=true')
    ? `${databaseUrl}${databaseUrl.includes('?') ? '&' : '?'}uselibpqcompat=true`
    : databaseUrl;

  const pool = new Pool({
    connectionString: connectionUrl,
    ssl: connectionUrl.includes('sslmode=require') || connectionUrl.includes('ssl=true') ? { rejectUnauthorized: false } : undefined,
    connectionTimeoutMillis: 5000,
    idleTimeoutMillis: 30000,
  });

  pool.on('error', (err) => {
    console.warn('[prisma/pg pool] Idle client error:', err.message);
  });

  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
