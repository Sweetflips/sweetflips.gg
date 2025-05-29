import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const API_URL = process.env.BASE_RAZED_API_URL as string;
    const REFERRAL_KEY = process.env.AUTH_RAZED as string;

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    const currentDay = now.getDate();

    let fromDate: Date;
    let toDate: Date;

    if (currentDay < 23) {
      fromDate = new Date(currentYear, currentMonth - 1, 23, 0, 0, 0);
      toDate = new Date(currentYear, currentMonth, 23, 23, 59, 59);
    } else {
      fromDate = new Date(currentYear, currentMonth, 23, 0, 0, 0);
      toDate = new Date(currentYear, currentMonth + 1, 23, 23, 59, 59);
    }

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