// lib/prisma.ts
import { PrismaClient } from '@prisma/client';
import { URL } from 'url';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Ensure DATABASE_URL is set - use POSTGRES_PRISMA_URL if available (Vercel Postgres)
if (!process.env.DATABASE_URL && process.env.POSTGRES_PRISMA_URL) {
  process.env.DATABASE_URL = process.env.POSTGRES_PRISMA_URL;
}

// Ensure SSL mode is set for postgres:// URLs (Vercel Postgres uses postgres:// not postgresql://)
if (process.env.DATABASE_URL) {
  const dbUrl = process.env.DATABASE_URL;
  if (dbUrl.startsWith('postgres://') || dbUrl.startsWith('postgresql://')) {
    try {
      const parsedUrl = new URL(dbUrl);
      if (!parsedUrl.searchParams.has('sslmode')) {
        parsedUrl.searchParams.set('sslmode', 'require');
        process.env.DATABASE_URL = parsedUrl.toString();
      }
    } catch (e) {
      // URL parsing failed, continue with original
    }
  }
}

export const prisma =
  globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
