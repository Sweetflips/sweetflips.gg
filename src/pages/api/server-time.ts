import type { NextApiRequest, NextApiResponse } from "next";

type ServerTimeResponse = {
  serverTime: number;
};

export default function handler(
  _req: NextApiRequest,
  res: NextApiResponse<ServerTimeResponse>,
) {
  res.setHeader("Cache-Control", "no-store, max-age=0");
  res.status(200).json({ serverTime: Date.now() });
}
