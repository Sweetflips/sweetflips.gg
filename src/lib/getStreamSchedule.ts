// lib/getStreamSchedule.ts
import { prisma } from '@/lib/prisma';

export async function getStreamSchedule() {
  return await prisma.streamSchedule.findMany();
}
