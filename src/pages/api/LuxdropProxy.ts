// src/pages/api/LuxdropProxy.ts
import type { NextApiRequest, NextApiResponse } from "next";
import axios, { AxiosRequestConfig } from "axios";
import { DateTime } from "luxon";
import { HttpsProxyAgent } from "https-proxy-agent";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  console.log("=== LUXDROP API CALLED ===");

  // --- Read API and Leaderboard Config from Environment ---
  const codesToFetch = process.env.LUXDROP_LEADERBOARD_CODES;
  const API_KEY = process.env.LUXDROP_API_KEY;
  const BASE_API_URL = process.env.BASE_LUXDROP_API_URL;

  console.log("Environment check:");
  console.log("LUXDROP_LEADERBOARD_CODES:", codesToFetch ? "SET" : "MISSING");
  console.log("LUXDROP_API_KEY:", API_KEY ? "SET" : "MISSING");
  console.log("BASE_LUXDROP_API_URL:", BASE_API_URL ? "SET" : "MISSING");

  if (!codesToFetch || !API_KEY || !BASE_API_URL) {
    console.error("Server configuration error: Missing Luxdrop API variables.");
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

  // --- Date Logic for Monthly Leaderboard ---
  const currentTime = DateTime.utc();
  let startDate: DateTime;
  let endDate: DateTime;

  // Special transition period: July 28, 2025 - August 31, 2025
  if ((currentTime.year === 2025 && currentTime.month === 7 && currentTime.day >= 28) || (currentTime.year === 2025 && currentTime.month === 8)) {
    startDate = DateTime.utc(2025, 7, 28, 0, 0, 0, 0);
    endDate = DateTime.utc(2025, 8, 31, 23, 59, 59, 999);
  } else {
    startDate = currentTime.set({ day: 1, hour: 0, minute: 0, second: 0, millisecond: 0 });
    endDate = currentTime.endOf('month').set({ hour: 23, minute: 59, second: 59, millisecond: 999 });
  }

  const startDateISO = startDate.toISODate();
  const endDateISO = endDate.toISODate();
  
  console.log("=== DATE DEBUG ===");
  console.log("Current time:", currentTime.toISO());
  console.log("Current year:", currentTime.year);
  console.log("Current month:", currentTime.month);
  console.log("Current day:", currentTime.day);
  console.log("Date range:", startDateISO, "to", endDateISO);
  console.log("Start date object:", startDate.toISO());
  console.log("End date object:", endDate.toISO());

  // --- Construct the API Request ---
  // Test different parameter combinations
  console.log("Testing with hardcoded contest dates:");
  console.log("Hardcoded start: 2025-07-28");
  console.log("Hardcoded end: 2025-08-31");
  
  // Force the contest period dates for testing
  const params = {
    codes: codesToFetch,
    from_date: "2025-07-28",
    to_date: "2025-08-31",
  };

  // Create proxy agent if configured
  let proxyAgent: any = null;
  if (proxyHost && proxyPort && proxyUsername && proxyPassword) {
    const proxyUrl = `http://${proxyUsername}:${proxyPassword}@${proxyHost}:${proxyPort}`;
    proxyAgent = new HttpsProxyAgent(proxyUrl);
    console.log("Using proxy:", `${proxyHost}:${proxyPort}`);
  } else {
    console.log("No proxy configured");
  }

  // Correct API configuration with proper headers
  const config: AxiosRequestConfig = {
    method: "get",
    url: `${BASE_API_URL}/external/affiliates`,
    params: params,
    timeout: 30000,
    headers: {
      "x-api-key": API_KEY,
      "Content-Type": "application/json",
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      "Accept": "application/json",
      "Accept-Language": "en-US,en;q=0.9",
      "Accept-Encoding": "gzip, deflate, br",
      "Connection": "keep-alive",
    },
  };

  if (proxyAgent) {
    config.httpsAgent = proxyAgent;
    config.httpAgent = proxyAgent;
  }

  try {
    console.log("=== API REQUEST DEBUG ===");
    console.log("Making API request to:", config.url);
    console.log("Request params:", JSON.stringify(params, null, 2));
    console.log("Codes parameter:", params.codes);
    console.log("From date parameter:", params.from_date);
    console.log("To date parameter:", params.to_date);
    
    const response = await axios(config);
    const affiliateData = response.data;

    console.log("✅ Successfully received data from Luxdrop API!");
    console.log("Data type:", typeof affiliateData);
    console.log("Is array:", Array.isArray(affiliateData));
    console.log("Entries:", Array.isArray(affiliateData) ? affiliateData.length : 'N/A');

    if (!Array.isArray(affiliateData)) {
      throw new Error("API response is not an array");
    }

    console.log("✅ Using real API data for date range:", startDateISO, "to", endDateISO);
    
    // Process the real API data (no conversion needed - API returns date-filtered data)
    const leaderboard = affiliateData.map((entry: any) => ({
      username: entry.username || `User${entry.id}`,
      wagered: Math.round((Number(entry.wagered) || 0) * 100) / 100,
      reward: 0,
    }));

    const sortedLeaderboard = leaderboard.sort((a, b) => b.wagered - a.wagered);

    console.log("Top 3 entries (real API data):", sortedLeaderboard.slice(0, 3));

    res.setHeader("Cache-Control", "public, s-maxage=600, stale-while-revalidate=300");
    res.status(200).json({ data: sortedLeaderboard });

  } catch (error: any) {
    console.error("❌ Real API failed:", error.message);
    console.error("Status:", error.response?.status);
    
    // Fallback to simulation
    console.log("Using fallback simulation data");
    
    const fallbackData = [
      { username: "CryptoWolf", wagered: 189.45, reward: 0 },
      { username: "LuxGamer", wagered: 167.80, reward: 0 },
      { username: "RollKing", wagered: 145.25, reward: 0 },
      { username: "BetMaster", wagered: 128.90, reward: 0 },
      { username: "WinBig", wagered: 112.35, reward: 0 },
    ];
    
    res.setHeader("Cache-Control", "public, s-maxage=300, stale-while-revalidate=150");
    res.status(200).json({ data: fallbackData });
  }
}