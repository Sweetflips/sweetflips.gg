import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const API_URL = process.env.BASE_RAZED_API_URL as string;
    const REFERRAL_KEY = process.env.AUTH_RAZED as string;

    if (!API_URL || !REFERRAL_KEY) {
      return res.status(500).json({ error: "Missing BASE_RAZED_API_URL or AUTH_RAZED in environment variables" });
    }

    const now = new Date(); // Current date in UTC

    // Special weekly event dates - configurable via environment variables
    // Format: YYYY-MM-DD (e.g., "2025-06-23")
    const specialStartEnv = process.env.SPECIAL_PERIOD_START_DATE;
    const specialEndEnv = process.env.SPECIAL_PERIOD_END_DATE;

    let SPECIAL_PERIOD_START_DATE: Date | null = null;
    let SPECIAL_PERIOD_END_DATE: Date | null = null;

    if (specialStartEnv && specialEndEnv) {
      const [startYear, startMonth, startDay] = specialStartEnv.split('-').map(Number);
      const [endYear, endMonth, endDay] = specialEndEnv.split('-').map(Number);
      SPECIAL_PERIOD_START_DATE = new Date(Date.UTC(startYear, startMonth - 1, startDay, 0, 0, 0, 0));
      SPECIAL_PERIOD_END_DATE = new Date(Date.UTC(endYear, endMonth - 1, endDay, 23, 59, 59, 999));
    }

    let fromDate: Date;
    let toDate: Date;

    // Check if special period is configured and active
    if (SPECIAL_PERIOD_START_DATE && SPECIAL_PERIOD_END_DATE &&
        now >= SPECIAL_PERIOD_START_DATE && now <= SPECIAL_PERIOD_END_DATE) {
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
        "Cache-Control": "no-cache",
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
    console.error("RazedProxy error:", error);
    return res.status(500).json({
      error: "Failed to fetch API data",
      message: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString()
    });
  }
}
