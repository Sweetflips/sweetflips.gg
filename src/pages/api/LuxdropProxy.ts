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

  console.log("=== LUXDROP API CALLED ===");

  // --- Read API and Leaderboard Config from Environment ---
  const API_KEY = process.env.LUXDROP_API_KEY;

  console.log("Environment check:");
  console.log("LUXDROP_API_KEY:", API_KEY ? "SET" : "MISSING");

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

  // --- Date Logic for Fixed September 2025 Period ---
  const currentTime = DateTime.utc();
  let startDate: DateTime;
  let endDate: DateTime;

  // Fixed September 2025 Period: September 1-30, 2025
  // Start: September 1, 2025 at 00:00:00
  // End: September 30, 2025 at 23:59:59
  startDate = DateTime.utc(2025, 9, 1, 0, 0, 0, 0);
  endDate = DateTime.utc(2025, 9, 30, 23, 59, 59, 999);

  const startDateISO = startDate.toISODate(); // "2025-09-01"
  const endDateISO = endDate.toISODate();     // "2025-09-30"

  console.log("=== DATE DEBUG (FIXED SEPTEMBER 2025 PERIOD) ===");
  console.log("Current time:", currentTime.toISO());
  console.log("Current year:", currentTime.year);
  console.log("Current month:", currentTime.month);
  console.log("Current day:", currentTime.day);
  console.log("Fixed September 2025 period:", startDateISO, "to", endDateISO);
  console.log("Start date object:", startDate.toISO());
  console.log("End date object:", endDate.toISO());

  // --- Construct the API Request ---
  // Using exact parameters that work in Python script: codes, startDate, endDate
  const params = {
    codes: "sweetflips", // Use exact working affiliate code
    startDate: startDateISO, // "2025-09-01"
    endDate: endDateISO,     // "2025-09-30"
  };

  console.log("=== API PARAMETERS ===");
  console.log("Request params:", JSON.stringify(params, null, 2));

  // Create proxy agent if configured
  let proxyAgent: any = null;
  if (proxyHost && proxyPort && proxyUsername && proxyPassword) {
    const proxyUrl = `http://${proxyUsername}:${proxyPassword}@${proxyHost}:${proxyPort}`;
    proxyAgent = new HttpsProxyAgent(proxyUrl);
    console.log("Using proxy:", `${proxyHost}:${proxyPort}`);
  } else {
    console.log("No proxy configured");
  }

  // Exact API configuration matching working Python script
  const config: AxiosRequestConfig = {
    method: "get",
    url: "https://api.luxdrop.com/external/affiliates", // Use exact URL from Python script
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

  try {
    console.log("=== API REQUEST DEBUG ===");
    console.log("Making API request to:", config.url);
    console.log("Request params:", JSON.stringify(params, null, 2));
    console.log("Codes parameter:", params.codes);
    console.log("Start date parameter:", params.startDate);
    console.log("End date parameter:", params.endDate);

    const response = await axios(config);
    const affiliateData: AffiliateEntry[] = response.data;

    console.log("✅ Successfully received data from Luxdrop API!");
    console.log("Data type:", typeof affiliateData);
    console.log("Is array:", Array.isArray(affiliateData));
    console.log("Entries:", Array.isArray(affiliateData) ? affiliateData.length : 'N/A');

    if (!Array.isArray(affiliateData)) {
      throw new Error("API response is not an array");
    }

    console.log("✅ Using fixed September 2025 period API data");
    console.log("Period:", startDateISO, "to", endDateISO);

    // Validate we have reasonable contest period data
    const totalWagered = affiliateData.reduce((sum: number, entry: AffiliateEntry) => sum + (Number(entry.wagered) || 0), 0);
    console.log("Total wagered from API:", totalWagered);

    // Filter only users with wagers > 0 (like Python script does)
    const activeWagerers = affiliateData.filter((entry: AffiliateEntry) => Number(entry.wagered) > 0);
    console.log("Active wagerers:", activeWagerers.length, "of", affiliateData.length);

    // Process the real API data - sort by wagered amount descending
    const leaderboard: LeaderboardEntry[] = activeWagerers
      .map((entry: AffiliateEntry) => ({
        username: entry.username || `User${entry.id}`,
        wagered: Math.round((Number(entry.wagered) || 0) * 100) / 100,
        reward: 0,
      }))
      .sort((a, b) => b.wagered - a.wagered)
      .slice(0, 100); // Top 100 for performance

    console.log(`September 2025 leaderboard generated:`);
    console.log("- Total active wagerers:", leaderboard.length);
    if (leaderboard.length > 0) {
      console.log("- Top wagerer:", leaderboard[0].username, "$" + leaderboard[0].wagered);
    }
    console.log("- Total September wagered: $" + totalWagered.toFixed(2));

    // Include metadata about the September 2025 period
    const responseData = {
      data: leaderboard,
      period: {
        month: "September",
        year: 2025,
        startDate: startDateISO,
        endDate: endDateISO,
      }
    };

    res.setHeader("Cache-Control", "public, s-maxage=600, stale-while-revalidate=300");
    res.status(200).json(responseData);

  } catch (error: any) {
    console.error("❌ Real API failed:", error.message);
    console.error("Status:", error.response?.status);

    // Return error when API fails - no fallback data needed
    res.status(500).json({
      error: "Failed to fetch leaderboard data",
      message: error.message
    });
  }
}
