// src/pages/api/LuxdropProxy.ts
import axios, { AxiosRequestConfig } from "axios";
import { HttpsProxyAgent } from "https-proxy-agent";
import { DateTime } from "luxon";
import type { NextApiRequest, NextApiResponse } from "next";

// Type definitions
interface AffiliateEntry {
  id?: string;
  username: string;
  wagered: number | string;
}

interface LeaderboardEntry {
  username: string;
  wagered: number;
  reward: number;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  // --- Read API and Leaderboard Config from Environment ---
  const API_KEY = process.env.LUXDROP_API_KEY;

  if (!API_KEY) {
    console.error("Server configuration error: Missing Luxdrop API key.");
    return res.status(500).json({ error: "Server-side configuration is incomplete." });
  }

  // --- Read Proxy Details from Environment ---
  const proxyHost = process.env.PROXY_HOST;
  const proxyPortString = process.env.PROXY_PORT;
  const proxyUsername = process.env.PROXY_USERNAME;
  const proxyPassword = process.env.PROXY_PASSWORD;

  let proxyPort: number | undefined = undefined;
  if (proxyPortString) {
    const parsedPort = parseInt(proxyPortString, 10);
    if (!isNaN(parsedPort)) {
      proxyPort = parsedPort;
    }
  }

  const currentTime = DateTime.utc();
  const currentDay = currentTime.day;
  const currentMonth = currentTime.month;
  const currentYear = currentTime.year;

  let startDate: DateTime;
  let endDate: DateTime;
  let periodLabel: string;

  // Luxdrop period configuration - configurable via environment variables
  // Format: YYYY-MM-DD (e.g., "2025-11-01")
  const luxdropPeriodYearEnv = process.env.LUXDROP_PERIOD_YEAR;
  const luxdropPeriodMonthEnv = process.env.LUXDROP_PERIOD_MONTH;

  const periodYear = luxdropPeriodYearEnv ? parseInt(luxdropPeriodYearEnv, 10) : currentYear;
  const periodMonth = luxdropPeriodMonthEnv ? parseInt(luxdropPeriodMonthEnv, 10) : currentMonth;

  if (currentMonth === periodMonth && currentYear === periodYear) {
    if (currentDay >= 1 && currentDay <= 15) {
      startDate = DateTime.utc(periodYear, periodMonth, 1, 0, 0, 0);
      endDate = DateTime.utc(periodYear, periodMonth, 15, 23, 59, 59);
      periodLabel = `${DateTime.fromObject({ month: periodMonth, year: periodYear }).toFormat('MMMM')} 1-15, ${periodYear}`;
    } else {
      startDate = DateTime.utc(periodYear, periodMonth, 16, 0, 0, 0);
      endDate = DateTime.utc(periodYear, periodMonth, 30, 23, 59, 59);
      periodLabel = `${DateTime.fromObject({ month: periodMonth, year: periodYear }).toFormat('MMMM')} 16-30, ${periodYear}`;
    }
  } else {
    // Default to first half of configured period month
    startDate = DateTime.utc(periodYear, periodMonth, 1, 0, 0, 0);
    endDate = DateTime.utc(periodYear, periodMonth, 15, 23, 59, 59);
    periodLabel = `${DateTime.fromObject({ month: periodMonth, year: periodYear }).toFormat('MMMM')} 1-15, ${periodYear}`;
  }

  const startDateISO = startDate.toISODate();
  const endDateISO = endDate.toISODate();

  // Create proxy agent if configured
  let proxyAgent: HttpsProxyAgent | null = null;
  if (proxyHost && proxyPort) {
    // Support proxy with or without authentication
    let proxyUrl: string;
    if (proxyUsername && proxyPassword) {
      proxyUrl = `http://${proxyUsername}:${proxyPassword}@${proxyHost}:${proxyPort}`;
    } else {
      proxyUrl = `http://${proxyHost}:${proxyPort}`;
    }
    proxyAgent = new HttpsProxyAgent(proxyUrl);
  }

  try {
    // Use BOTH startDate and endDate to get period-specific data
    const params = {
      codes: "sweetflips",
      startDate: startDateISO, // "2025-09-01"
      endDate: endDateISO,     // "2025-09-30"
    };

    const config: AxiosRequestConfig = {
      method: "get",
      url: "https://api.luxdrop.com/external/affiliates",
      params: params,
      timeout: 30000,
      headers: {
        "x-api-key": API_KEY,
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "Accept": "application/json",
      },
    };

    if (proxyAgent) {
      config.httpsAgent = proxyAgent;
      config.httpAgent = proxyAgent;
    }

    const response = await axios(config);
    const monthlyData: AffiliateEntry[] = response.data;

    if (!Array.isArray(monthlyData)) {
      throw new Error("API response is not an array");
    }

    // Filter only users with wagers > 0 for this bi-weekly period
    const activeWagerers = monthlyData.filter((entry: AffiliateEntry) => {
      const wagered = Number(entry.wagered) || 0;
      return wagered > 0;
    });

    // Process the bi-weekly data - sort by wagered amount descending
    const leaderboard: LeaderboardEntry[] = activeWagerers
      .map((entry: AffiliateEntry) => ({
        username: entry.username || `User${entry.id}`,
        wagered: Math.round((Number(entry.wagered) || 0) * 100) / 100,
        reward: 0,
      }))
      .sort((a, b) => b.wagered - a.wagered)
      .slice(0, 100); // Top 100

    const responseData = {
      data: leaderboard,
      period: {
        month: DateTime.fromObject({ month: periodMonth, year: periodYear }).toFormat('MMMM'),
        year: periodYear,
        period: periodLabel,
        startDate: startDateISO,
        endDate: endDateISO,
        note: `Leaderboard data from ${startDateISO} to ${endDateISO}`
      }
    };

    res.setHeader("Cache-Control", "public, s-maxage=600, stale-while-revalidate=300");
    res.status(200).json(responseData);

  } catch (error: any) {
    console.error("Luxdrop API request failed:", error.message);
    if (error.response?.status) {
      console.error("Status:", error.response.status);
      console.error("Response data:", error.response.data);
    }
    if (error.request) {
      console.error("Request made but no response received:", error.request);
    }

    // Return more detailed error information
    const errorMessage = error.response?.data?.message || error.message || "Unknown error";
    const statusCode = error.response?.status || 500;

    res.status(statusCode).json({
      error: "Failed to fetch leaderboard data",
      message: errorMessage,
      details: error.response?.data || null,
      timestamp: new Date().toISOString()
    });
  }
}
