import { prisma } from '@/../../lib/prisma';
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const id = Number(req.query.id);

  if (req.method === "DELETE") {
    await prisma.streamSchedule.delete({ where: { id } });
    return res.status(204).end();
  }

  if (req.method === "PUT") {
    const { day, name, titel, time } = req.body;

    const updated = await prisma.streamSchedule.update({
      where: { id },
      data: { day, name, titel, time },
    });

    return res.status(200).json(updated);
  }

  return res.status(405).end();
}
