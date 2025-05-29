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
    const currentDate = DateTime.now().setZone('Europe/Amsterdam');
    const currentYear = currentDate.year;
    const currentMonth = currentDate.month;
    const currentDay = currentDate.day;

    let afterDate: string;
    let beforeDate: string;

    if (currentDay >= 27) {
      afterDate = `${currentYear}-${currentMonth < 10 ? "0" : ""}${currentMonth}-27`;
      const nextMonth = currentMonth === 12 ? 1 : currentMonth + 1;
      const nextMonthYear = currentMonth === 12 ? currentYear + 1 : currentYear;
      beforeDate = `${nextMonthYear}-${nextMonth < 10 ? "0" : ""}${nextMonth}-28`;
    } else {
      const startMonth = currentMonth === 1 ? 12 : currentMonth - 1;
      const startYear = currentMonth === 1 ? currentYear - 1 : currentYear;
      afterDate = `${startYear}-${startMonth < 10 ? "0" : ""}${startMonth}-27`;
      beforeDate = `${currentYear}-${currentMonth < 10 ? "0" : ""}${currentMonth}-28`;
    }

    const afterTimestamp = Math.floor(DateTime.fromISO(afterDate, { zone: 'Europe/Amsterdam' }).toSeconds());
    const beforeTimestamp = Math.floor(DateTime.fromISO(beforeDate, { zone: 'Europe/Amsterdam' }).toSeconds());

// console.log("Current Unix Timestamps:");
// console.log("After Timestamp:", afterTimestamp);
// console.log("Before Timestamp:", beforeTimestamp);

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
      data: data, 
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