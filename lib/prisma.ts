// lib/prisma.ts
import { PrismaClient } from '@prisma/client';
import { URL } from 'url';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

if (process.env.DATABASE_URL && process.env.DATABASE_URL.startsWith('postgresql://')) {
  const parsedUrl = new URL(process.env.DATABASE_URL);
  if (!parsedUrl.searchParams.has('sslmode')) {
    parsedUrl.searchParams.set('sslmode', 'require');
    process.env.DATABASE_URL = parsedUrl.toString();
  }
}

export const prisma =
  globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;