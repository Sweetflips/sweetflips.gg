import { DateTime } from 'luxon';
import axios from 'axios';
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // TODO: Ensure BASE_LUXDROP_API_URL (e.g., https://api.luxdrop.com) and LUXDROP_API_KEY are set in environment variables.
    const BASE_API_URL = process.env.BASE_LUXDROP_API_URL || "https://api.luxdrop.com";
    const API_KEY = process.env.LUXDROP_API_KEY;

    if (!API_KEY) {
      return res.status(500).json({ error: "Missing LUXDROP_API_KEY in environment variables" });
    }

    const codes = "sweetflips"; // Placeholder - get this from user or config

    // Use UTC for consistent global logic
    const now = DateTime.utc();
    const currentYear = now.year;
    const currentMonth = now.month;
    const currentDay = now.day;

    let afterDateTime: DateTime;
    let beforeDateTime: DateTime;

    // Retain existing date logic: 27th of previous/current month to 28th of current/next month
    if (currentDay >= 27) {
      afterDateTime = DateTime.utc(currentYear, currentMonth, 27).startOf("day");
      const nextMonth = currentMonth === 12 ? 1 : currentMonth + 1;
      const nextYear = currentMonth === 12 ? currentYear + 1 : currentYear;
      beforeDateTime = DateTime.utc(nextYear, nextMonth, 28).startOf("day");
    } else {
      const prevMonth = currentMonth === 1 ? 12 : currentMonth - 1;
      const prevYear = currentMonth === 1 ? currentYear - 1 : currentYear;
      afterDateTime = DateTime.utc(prevYear, prevMonth, 27).startOf("day");
      beforeDateTime = DateTime.utc(currentYear, currentMonth, 28).startOf("day");
    }

    const startDate = afterDateTime.toISODate(); // YYYY-MM-DD
    const endDate = beforeDateTime.toISODate();   // YYYY-MM-DD

    const apiUrl = `${BASE_API_URL}/external/affiliates`;

    const params = new URLSearchParams({
      codes: codes,
      startDate: startDate as string,
      endDate: endDate as string,
    });

    const config = {
      method: 'get',
      url: `${apiUrl}?${params.toString()}`,
      headers: {
        'x-api-key': API_KEY,
        'Accept': 'application/json', // Good practice to specify accept header
      },
      maxBodyLength: Infinity,
    };

    const response = await axios(config);

    const result = response.data;
    // Add the date range back to the response for the frontend, similar to old API
    result.dates = {
      afterDate: startDate,  // e.g., "2025-05-27"
      beforeDate: endDate, // e.g., "2025-06-28"
    };

    // Cache headers
    res.setHeader('Cache-Control', 'public, max-age=600, s-maxage=600'); // Cache for 10 minutes
    res.setHeader('Last-Modified', new Date().toUTCString());

    return res.status(200).json(result);
  } catch (error: any) {
    console.error("Luxdrop Proxy Error:", error?.response?.data || error.message);
    return res.status(500).json({
      error: "Failed to fetch API data from Luxdrop",
      details: error?.response?.data || error.message,
    });
  }
}