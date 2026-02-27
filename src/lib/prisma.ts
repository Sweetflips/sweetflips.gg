// lib/prisma.ts
import { PrismaClient } from '../../prisma/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Ensure DATABASE_URL is set - use POSTGRES_PRISMA_URL if available (Vercel Postgres)
const databaseUrl = process.env.DATABASE_URL || process.env.POSTGRES_PRISMA_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL or POSTGRES_PRISMA_URL must be set');
}

// Create PostgreSQL connection pool
const pool = new Pool({
  connectionString: databaseUrl,
  ssl: databaseUrl.includes('sslmode=require') || databaseUrl.includes('ssl=true') ? { rejectUnauthorized: false } : undefined,
});

// Create Prisma adapter
const adapter = new PrismaPg(pool);

export const prisma =
  globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
