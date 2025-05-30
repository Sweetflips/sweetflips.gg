import { DateTime } from 'luxon';
import axios from 'axios';
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const API_URL = process.env.BASE_EMPIREDROP_API_URL as string;
    const PRIVATE_KEY = process.env.PRIVATE_KEY_EMPIREDROP as string;

    if (!API_URL || !PRIVATE_KEY) {
      return res.status(500).json({ error: "Missing API_URL or PRIVATE_KEY in environment variables" });
    }

    // Use UTC for consistent global logic
    const now = DateTime.utc();
    const currentYear = now.year;
    const currentMonth = now.month;
    const currentDay = now.day;

    let afterDateTime: DateTime;
    let beforeDateTime: DateTime;

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

    const afterTimestamp = Math.floor(afterDateTime.toSeconds());
    const beforeTimestamp = Math.floor(beforeDateTime.toSeconds());

    // Prepare body
    const data = {
      start_timestamp: afterTimestamp,
      end_timestamp: beforeTimestamp,
    };

    const config = {
      method: 'get',
      url: API_URL,
      headers: {
        'Content-Type': 'application/json',
        'X-Private-Key': PRIVATE_KEY,
      },
      data: data, // Yes, Axios allows body in GET request
      maxBodyLength: Infinity,
    };

    const response = await axios(config);

    const result = response.data;
    result.dates = {
      afterDate: afterDateTime.toISODate(),  // e.g., "2025-05-27"
      beforeDate: beforeDateTime.toISODate(), // e.g., "2025-06-28"
    };

    // Cache headers
    res.setHeader('Cache-Control', 'public, max-age=600, s-maxage=600');
    res.setHeader('Last-Modified', new Date().toUTCString());

    return res.status(200).json(result);
  } catch (error: any) {
    console.error("EmpireDrop Proxy Error:", error?.response?.data || error.message);
    return res.status(500).json({
      error: "Failed to fetch API data",
      details: error?.response?.data || error.message,
    });
  }
}