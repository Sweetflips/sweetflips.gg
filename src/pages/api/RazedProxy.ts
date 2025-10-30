import type { NextApiRequest, NextApiResponse } from "next";
import { getUserFromRequest } from "@/lib/getUserFromRequest";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Require authentication
  const user = await getUserFromRequest(req, res);
  if (!user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const API_URL = process.env.BASE_RAZED_API_URL as string;
    const REFERRAL_KEY = process.env.AUTH_RAZED as string;

    if (!API_URL || !REFERRAL_KEY) {
      return res.status(500).json({ error: "Missing BASE_RAZED_API_URL or AUTH_RAZED in environment variables" });
    }

    const now = new Date(); // Current date in UTC

    // Define the specific start and end dates for the special weekly event
    const SPECIAL_PERIOD_START_DATE = new Date(Date.UTC(2025, 5, 23, 0, 0, 0, 0)); // June 23, 2025, 00:00:00.000 UTC (month is 0-indexed)
    const SPECIAL_PERIOD_END_DATE = new Date(Date.UTC(2025, 5, 30, 23, 59, 59, 999)); // June 30, 2025, 23:59:59.999 UTC

    let fromDate: Date;
    let toDate: Date;

    // Check if 'now' is within the special weekly event period
    if (now >= SPECIAL_PERIOD_START_DATE && now <= SPECIAL_PERIOD_END_DATE) {
      // Special Weekly Event Logic (June 23-30, 2025)
      fromDate = SPECIAL_PERIOD_START_DATE;
      toDate = SPECIAL_PERIOD_END_DATE;
    } else {
      // Standard Monthly Logic (1st to last day of the current actual month)
      fromDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 0, 0, 0, 0));
      toDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0, 23, 59, 59, 999)); // Day 0 of next month is last day of current
    }

    const formatDate = (date: Date) => {
      const pad = (n: number) => String(n).padStart(2, "0");
      // Use getUTC methods for formatting to ensure consistency
      return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())} ${pad(date.getUTCHours())}:${pad(date.getUTCMinutes())}:${pad(date.getUTCSeconds())}`;
    };

    const fromParam = formatDate(fromDate);
    const toParam = formatDate(toDate);

    const urlWithParams = `${API_URL}&from=${encodeURIComponent(fromParam)}&to=${encodeURIComponent(toParam)}&top=50`;

    const response = await fetch(urlWithParams, {
      method: "GET",
      headers: {
        "X-Referral-Key": REFERRAL_KEY,
      },
    });

    const textResponse = await response.text();

    try {
      const jsonResponse = JSON.parse(textResponse);

      // 🔥 Mask usernames before sending to client
      const maskUsername = (username: string) => {
        const len = username.length;
        if (len <= 2) return username;
        if (len <= 4) return username[0] + '*'.repeat(len - 2) + username[len - 1];
        return username.slice(0, 2) + '*'.repeat(len - 4) + username.slice(-2);
      };

      if (Array.isArray(jsonResponse.data)) {
        jsonResponse.data = jsonResponse.data.map((entry: any) => ({
          ...entry,
          username: maskUsername(entry.username),
        }));
      }

      res.setHeader('Cache-Control', 'public, max-age=600, s-maxage=600');
      res.setHeader('Last-Modified', new Date().toUTCString());

      return res.status(200).json(jsonResponse);
    } catch (err) {
      return res.status(500).json({ error: "Invalid JSON response from API" });
    }
  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch API data" });
  }
}