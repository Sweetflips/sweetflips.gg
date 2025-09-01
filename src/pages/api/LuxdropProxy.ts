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
  
  // Get the current month's start and end dates
  // Start: First day of current month (e.g., "2025-09-01")
  // End: Last day of current month (e.g., "2025-09-30")
  const startOfMonth = currentTime.startOf('month');
  const endOfMonth = currentTime.endOf('month');
  
  // Format dates as YYYY-MM-DD (required by API)
  const startDateISO = startOfMonth.toISODate(); // "2025-09-01"
  const endDateISO = endOfMonth.toISODate();     // "2025-09-30"
  
  console.log("=== DATE DEBUG (MONTHLY PERIOD) ===");
  console.log("Current UTC time:", currentTime.toISO());
  console.log("Current month:", currentTime.monthLong, currentTime.year);
  console.log("Month start date:", startDateISO);
  console.log("Month end date:", endDateISO);
  console.log("Fetching data for period:", startDateISO, "to", endDateISO);

  // Create proxy agent if configured
  let proxyAgent: any = null;
  if (proxyHost && proxyPort && proxyUsername && proxyPassword) {
    const proxyUrl = `http://${proxyUsername}:${proxyPassword}@${proxyHost}:${proxyPort}`;
    proxyAgent = new HttpsProxyAgent(proxyUrl);
    console.log("Using proxy:", `${proxyHost}:${proxyPort}`);
  } else {
    console.log("No proxy configured");
  }

  try {
    // According to the API documentation:
    // When BOTH startDate and endDate are provided, 
    // the API returns data for that SPECIFIC period only
    const params = {
      codes: "sweetflips",
      startDate: startDateISO,  // e.g., "2025-09-01" 
      endDate: endDateISO,      // e.g., "2025-09-30"
    };

    console.log("=== API PARAMETERS ===");
    console.log("Request params:", JSON.stringify(params, null, 2));
    console.log("This should return data ONLY for:", currentTime.monthLong, currentTime.year);

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

    console.log("Making API request to:", config.url);
    console.log("With query parameters:", params);
    
    const response = await axios(config);
    const affiliateData: AffiliateEntry[] = response.data;

    console.log("✅ Successfully received data from Luxdrop API!");
    console.log("Response data type:", typeof affiliateData);
    console.log("Is array:", Array.isArray(affiliateData));
    console.log("Total entries received:", Array.isArray(affiliateData) ? affiliateData.length : 'N/A');

    if (!Array.isArray(affiliateData)) {
      throw new Error("API response is not an array");
    }

    // Log sample data to verify it's for the correct period
    if (affiliateData.length > 0) {
      console.log("Sample entry:", JSON.stringify(affiliateData[0], null, 2));
    }

    // Filter only users with wagers > 0 for this specific month
    const activeWagerers = affiliateData.filter((entry: AffiliateEntry) => {
      const wagered = Number(entry.wagered) || 0;
      return wagered > 0;
    });

    console.log("Active wagerers for", currentTime.monthLong + ":", activeWagerers.length, "of", affiliateData.length);
    
    // Calculate total wagered for this month
    const totalMonthlyWagered = activeWagerers.reduce((sum: number, entry: AffiliateEntry) => {
      return sum + (Number(entry.wagered) || 0);
    }, 0);
    
    console.log("Total wagered in", currentTime.monthLong + ":", "$" + totalMonthlyWagered.toFixed(2));

    // Create leaderboard sorted by wagered amount (descending)
    const leaderboard: LeaderboardEntry[] = activeWagerers
      .map((entry: AffiliateEntry) => ({
        username: entry.username || `User${entry.id}`,
        wagered: Math.round((Number(entry.wagered) || 0) * 100) / 100,
        reward: 0, // Calculate rewards based on your reward structure
      }))
      .sort((a, b) => b.wagered - a.wagered)
      .slice(0, 100); // Top 100 for performance

    console.log("=== LEADERBOARD SUMMARY ===");
    console.log(`${currentTime.monthLong} ${currentTime.year} Monthly Leaderboard:`);
    console.log("- Period:", startDateISO, "to", endDateISO);
    console.log("- Total active wagerers:", leaderboard.length);
    if (leaderboard.length > 0) {
      console.log("- #1 Player:", leaderboard[0].username, "- $" + leaderboard[0].wagered);
      if (leaderboard.length > 1) {
        console.log("- #2 Player:", leaderboard[1].username, "- $" + leaderboard[1].wagered);
      }
      if (leaderboard.length > 2) {
        console.log("- #3 Player:", leaderboard[2].username, "- $" + leaderboard[2].wagered);
      }
    }
    console.log("- Total monthly wagered: $" + totalMonthlyWagered.toFixed(2));

    // Include metadata about the current period
    const responseData = {
      data: leaderboard,
      period: {
        month: currentTime.monthLong,
        year: currentTime.year,
        startDate: startDateISO,
        endDate: endDateISO,
        totalWagered: totalMonthlyWagered,
        activeUsers: leaderboard.length,
      }
    };

    // Cache for 10 minutes with stale-while-revalidate
    res.setHeader("Cache-Control", "public, s-maxage=600, stale-while-revalidate=300");
    res.status(200).json(responseData);

  } catch (error: any) {
    console.error("❌ API request failed:", error.message);
    console.error("Status:", error.response?.status);
    
    if (error.response?.data) {
      console.error("API Error Response:", JSON.stringify(error.response.data, null, 2));
    }

    // Return error when API fails
    res.status(500).json({
      error: "Failed to fetch leaderboard data",
      message: error.message,
      details: error.response?.data || null
    });
  }
}
