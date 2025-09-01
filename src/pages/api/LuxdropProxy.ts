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

  // --- Date Logic for Monthly Resetting Period ---
  const currentTime = DateTime.utc();
  
  // Since it's September 1st, 2025, and we want September data only
  // We need to be careful about the date range
  let startDate: DateTime;
  let endDate: DateTime;

  // For the current month (September 2025)
  startDate = DateTime.utc(2025, 9, 1).startOf('day'); // September 1, 2025 00:00:00
  endDate = DateTime.utc(2025, 9, 30).endOf('day');    // September 30, 2025 23:59:59

  const startDateISO = startDate.toISODate(); // "2025-09-01"
  const endDateISO = endDate.toISODate();     // "2025-09-30"

  console.log("=== DATE DEBUG (SEPTEMBER 2025) ===");
  console.log("Current UTC time:", currentTime.toISO());
  console.log("Current date:", currentTime.toISODate());
  console.log("Current time:", currentTime.toFormat('HH:mm:ss'));
  console.log("Month: September 2025");
  console.log("Period: September 1-30, 2025");
  console.log("Start date:", startDateISO);
  console.log("End date:", endDateISO);

  // --- Construct the API Request ---
  const params = {
    codes: "sweetflips",
    startDate: startDateISO, // "2025-09-01"
    endDate: endDateISO,     // "2025-09-30"
  };

  console.log("=== API PARAMETERS ===");
  console.log("Request params:", JSON.stringify(params, null, 2));
  console.log("This should return data ONLY for September 2025");

  // Create proxy agent if configured
  let proxyAgent: any = null;
  if (proxyHost && proxyPort && proxyUsername && proxyPassword) {
    const proxyUrl = `http://${proxyUsername}:${proxyPassword}@${proxyHost}:${proxyPort}`;
    proxyAgent = new HttpsProxyAgent(proxyUrl);
    console.log("Using proxy:", `${proxyHost}:${proxyPort}`);
  } else {
    console.log("No proxy configured");
  }

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

  try {
    console.log("=== MAKING API REQUEST ===");
    console.log("URL:", config.url);
    console.log("Parameters:", params);

    const response = await axios(config);
    const affiliateData: AffiliateEntry[] = response.data;

    console.log("✅ API Response received");
    console.log("Total entries:", Array.isArray(affiliateData) ? affiliateData.length : 'N/A');

    if (!Array.isArray(affiliateData)) {
      throw new Error("API response is not an array");
    }

    // Log first few entries to debug
    if (affiliateData.length > 0) {
      console.log("Sample entries (first 3):");
      affiliateData.slice(0, 3).forEach((entry, idx) => {
        console.log(`  ${idx + 1}. ${entry.username}: $${entry.wagered}`);
      });
    }

    // Since it's early in September (Sept 1st), there might be limited data
    // Filter only users with wagers > 0
    const activeWagerers = affiliateData.filter((entry: AffiliateEntry) => {
      const wagered = Number(entry.wagered) || 0;
      return wagered > 0;
    });

    console.log("Active wagerers for September 2025:", activeWagerers.length);

    // Calculate total wagered
    const totalWagered = activeWagerers.reduce((sum: number, entry: AffiliateEntry) => {
      return sum + (Number(entry.wagered) || 0);
    }, 0);

    console.log("Total wagered in September 2025 so far: $" + totalWagered.toFixed(2));

    // Create leaderboard
    const leaderboard: LeaderboardEntry[] = activeWagerers
      .map((entry: AffiliateEntry) => ({
        username: entry.username || `User${entry.id}`,
        wagered: Math.round((Number(entry.wagered) || 0) * 100) / 100,
        reward: 0,
      }))
      .sort((a, b) => b.wagered - a.wagered)
      .slice(0, 100); // Top 100

    console.log("=== SEPTEMBER 2025 LEADERBOARD ===");
    console.log("Period: September 1-30, 2025");
    console.log("Current date/time:", currentTime.toISO());
    console.log("Active players:", leaderboard.length);
    if (leaderboard.length > 0) {
      console.log("Top 3 players:");
      leaderboard.slice(0, 3).forEach((player, idx) => {
        console.log(`  ${idx + 1}. ${player.username}: $${player.wagered}`);
      });
    }
    console.log("Total wagered: $" + totalWagered.toFixed(2));

    // Note: Since it's September 1st evening, there might not be much data yet
    if (leaderboard.length === 0) {
      console.log("⚠️ No wagering data yet for September 2025 (it's only day 1)");
    }

    const responseData = {
      data: leaderboard,
      period: {
        month: "September",
        year: 2025,
        startDate: startDateISO,
        endDate: endDateISO,
        currentDate: currentTime.toISODate(),
        currentTime: currentTime.toISO(),
        note: "September 2025 monthly leaderboard (resets monthly)",
      },
      stats: {
        totalWagered: totalWagered,
        activeUsers: leaderboard.length,
      }
    };

    res.setHeader("Cache-Control", "public, s-maxage=300, stale-while-revalidate=150");
    res.status(200).json(responseData);

  } catch (error: any) {
    console.error("❌ API request failed:", error.message);
    console.error("Status:", error.response?.status);
    
    if (error.response?.data) {
      console.error("API Error Response:", JSON.stringify(error.response.data, null, 2));
    }

    res.status(500).json({
      error: "Failed to fetch leaderboard data",
      message: error.message,
      details: error.response?.data || null
    });
  }
}
