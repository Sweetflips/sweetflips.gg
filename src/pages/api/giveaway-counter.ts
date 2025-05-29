import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    const counter = await prisma.giveawayCounter.findUnique({ where: { id: 1 } });

    if (!counter) return res.status(404).json({ error: "Not found" });

    return res.status(200).json({ amount: counter.amount });
  }

  res.setHeader("Allow", ["GET"]);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}