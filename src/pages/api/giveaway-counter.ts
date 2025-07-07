import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    try {
      let counter = await prisma.giveawayCounter.findUnique({ where: { id: 1 } });

      // If no counter exists, create one with default value
      if (!counter) {
        counter = await prisma.giveawayCounter.create({
          data: {
            id: 1,
            amount: 0.0
          }
        });
      }

      return res.status(200).json({ amount: counter.amount });
    } catch (error) {
      console.error("Error fetching giveaway counter:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  res.setHeader("Allow", ["GET"]);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}