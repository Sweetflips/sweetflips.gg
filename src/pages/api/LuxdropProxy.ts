// src/pages/api/LuxdropProxy.ts
import type { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const { codes, startDate, endDate } = req.query;

  if (!codes || typeof codes !== "string") {
    return res.status(400).json({ error: "The 'codes' parameter is required." });
  }

  const API_KEY = process.env.LUXDROP_API_KEY;
  const BASE_API_URL = process.env.BASE_LUXDROP_API_URL;

  if (!API_KEY || !BASE_API_URL) {
    console.error("Server configuration error: Missing Luxdrop API Key or URL.");
    return res.status(500).json({ error: "API credentials are not configured on the server." });
  }

  const params: { [key: string]: string } = { codes };
  if (startDate) params.startDate = startDate as string;
  if (endDate) params.endDate = endDate as string;

  try {
    const response = await axios.get(
      `${BASE_API_URL}/external/affiliates`,
      {
        params,
        headers: {
          "x-api-key": API_KEY,
          "Accept": "application/json"
        },
      },
    );

    // Cache headers for 10 minutes
    res.setHeader("Cache-Control", "public, s-maxage=600, stale-while-revalidate=300");

    res.status(200).json(response.data);
  } catch (error: any) {
    console.error("Luxdrop Proxy Error:", error.response?.data || error.message);
    const statusCode = error.response?.status || 500;
    const errorMessage = error.response?.data?.error || "Failed to fetch data from Luxdrop API.";
    res.status(statusCode).json({ error: errorMessage });
  }
}