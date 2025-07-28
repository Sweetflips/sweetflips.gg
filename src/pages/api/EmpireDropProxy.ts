import { DateTime } from 'luxon';
import axios from 'axios';
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const API_URL = process.env.BASE_EMPIREDROP_API_URL as string;
    const PRIVATE_KEY = process.env.PRIVATE_KEY_EMPIREDROP as string;

    if (!API_URL || !PRIVATE_KEY) {
      return res.status(500).json({ error: "Missing BASE_EMPIREDROP_API_URL or PRIVATE_KEY_EMPIREDROP in environment variables" });
    }
    const currentDate = DateTime.now().setZone('Europe/Amsterdam');
    const currentYear = currentDate.year;
    const currentMonth = currentDate.month;
    const currentDay = currentDate.day;

    let afterDate: string;
    let beforeDate: string;

    // Run leaderboard for the current month (1st to end of month)
    // Start from the 1st of the current month
    afterDate = `${currentYear}-${currentMonth < 10 ? "0" : ""}${currentMonth}-01`;
    
    // End at the last day of the current month
    const lastDayOfMonth = currentDate.endOf('month').day;
    beforeDate = `${currentYear}-${currentMonth < 10 ? "0" : ""}${currentMonth}-${lastDayOfMonth < 10 ? "0" : ""}${lastDayOfMonth}`;

    const afterTimestamp = Math.floor(DateTime.fromISO(afterDate, { zone: 'Europe/Amsterdam' }).toSeconds());
    const beforeTimestamp = Math.floor(DateTime.fromISO(beforeDate, { zone: 'Europe/Amsterdam' }).toSeconds());

    // Use query parameters for GET request
    const urlWithParams = `${API_URL}?start_timestamp=${afterTimestamp}&end_timestamp=${beforeTimestamp}`;
    const config = {
      method: 'get',
      url: urlWithParams,
      headers: {
        'Content-Type': 'application/json',
        'X-Private-Key': PRIVATE_KEY,
      },
      maxBodyLength: Infinity,
    };

    const response = await axios(config);

    const result = response.data;
    result.dates = { afterDate, beforeDate };

    res.setHeader('Cache-Control', 'public, max-age=600, s-maxage=600');
    res.setHeader('Last-Modified', new Date().toUTCString());

    return res.status(200).json(result);

  } catch (error: any) {
    console.error("EmpireDrop Proxy Error:", error?.response?.data || error.message);
    return res.status(500).json({ error: "Failed to fetch API data", details: error?.response?.data || error.message });
  }
}