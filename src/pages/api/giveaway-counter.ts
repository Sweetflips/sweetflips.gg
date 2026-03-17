import type { NextApiRequest, NextApiResponse } from "next";

// Base amount as of Jan 1, 2026 + 8,356 per day (no DB)
const BASE_AMOUNT = 1_744_944;
const DAILY_INCREASE = 8_356;
const BASE_DATE = new Date("2026-01-01T00:00:00Z");

function getGiveawayAmount(): number {
  const now = new Date();
  const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const base = new Date(Date.UTC(BASE_DATE.getUTCFullYear(), BASE_DATE.getUTCMonth(), BASE_DATE.getUTCDate()));
  const diffMs = today.getTime() - base.getTime();
  const daysElapsed = Math.floor(diffMs / (24 * 60 * 60 * 1000));
  return BASE_AMOUNT + daysElapsed * DAILY_INCREASE;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    const amount = getGiveawayAmount();
    return res.status(200).json({ amount });
  }

  res.setHeader("Allow", ["GET"]);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}
