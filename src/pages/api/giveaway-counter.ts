import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    let counter = await prisma.giveawayCounter.findUnique({ where: { id: 1 } });

    // If not found, create it automatically
    if (!counter) {
      counter = await prisma.giveawayCounter.create({
        data: { id: 1, amount: 0 }
      });
    }

    return res.status(200).json({ amount: counter.amount });
  }

  res.setHeader("Allow", ["GET"]);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}
