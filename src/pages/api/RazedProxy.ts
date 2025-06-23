import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const API_URL = process.env.BASE_RAZED_API_URL as string;
    const REFERRAL_KEY = process.env.AUTH_RAZED as string;

    if (!API_URL || !REFERRAL_KEY) {
      return res.status(500).json({ error: "Missing BASE_RAZED_API_URL or AUTH_RAZED in environment variables" });
    }    const now = new Date();

    // One-time weekly leaderboard from June 23 to June 30, 2025
    const fromDate = new Date(2025, 5, 23, 0, 0, 0); // June 23, 2025
    const toDate = new Date(2025, 5, 30, 23, 59, 59); // June 30, 2025

    const formatDate = (date: Date) => {
      const pad = (n: number) => String(n).padStart(2, "0");
      return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
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