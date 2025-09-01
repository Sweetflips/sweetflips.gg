// src/pages/api/LuxdropProxy.ts
import axios, { AxiosRequestConfig } from "axios";
import { HttpsProxyAgent } from "https-proxy-agent";
import { DateTime } from "luxon";
import type { NextApiRequest, NextApiResponse } from "next";

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
  
  // Get current month's start and end dates
  const startOfCurrentMonth = currentTime.startOf('month');
  const endOfCurrentMonth = currentTime.endOf('month');
  
  // Format dates as YYYY-MM-DD
  const startDateISO = startOfCurrentMonth.toISODate(); // "2025-09-01"
  const endDateISO = endOfCurrentMonth.toISODate();     // "2025-09-30"
  
  console.log("=== DATE DEBUG (MONTHLY PERIOD) ===");
  console.log("Current time:", currentTime.toISO());
  console.log("Current month:", currentTime.monthLong, currentTime.year);
  console.log("Period:", startDateISO, "to", endDateISO);

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
    // IMPORTANT: Use BOTH startDate and endDate to get period-specific data
    // According to API docs: this returns data for the specific period only
    const params = {
      codes: "sweetflips",
      startDate: startDateISO, // "2025-09-01" - MUST include this
      endDate: endDateISO,     // "2025-09-30" - together they define the period
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

    console.log("=== API REQUEST ===");
    console.log("Fetching data for period:", startDateISO, "to", endDateISO);
    console.log("Request params:", JSON.stringify(params, null, 2));
    
    const response = await axios(config);
    const monthlyData: any[] = response.data;

    console.log("✅ Successfully received monthly data!");
    console.log("Entries for", currentTime.monthLong + ":", monthlyData.length);

    if (!Array.isArray(monthlyData)) {
      throw new Error("API response is not an array");
    }

    // Filter only users with wagers > 0 for this month
    const activeMonthlyWagerers = monthlyData.filter((entry: any) => {
      const wagered = Number(entry.wagered) || 0;
      return wagered > 0;
    });
    
    console.log("Active wagerers this month:", activeMonthlyWagerers.length);
    
    const totalMonthlyWagered = activeMonthlyWagerers.reduce((sum: number, entry: any) => {
      return sum + (Number(entry.wagered) || 0);
    }, 0);
    
    console.log("Total wagered in", currentTime.monthLong + ":", "$" + totalMonthlyWagered.toFixed(2));

    // Process the monthly data - sort by wagered amount descending
    const leaderboard = activeMonthlyWagerers
      .map((entry: any) => ({
        username: entry.username || `User${entry.id}`,
        wagered: Math.round((Number(entry.wagered) || 0) * 100) / 100,
        reward: 0, // Calculate rewards based on your reward structure
      }))
      .sort((a, b) => b.wagered - a.wagered)
      .slice(0, 100); // Top 100 for performance

    console.log(`${currentTime.monthLong} ${currentTime.year} leaderboard generated:`);
    console.log("- Total active wagerers:", leaderboard.length);
    if (leaderboard.length > 0) {
      console.log("- Top wagerer:", leaderboard[0].username, "$" + leaderboard[0].wagered);
    }

    // Include metadata about the current period
    const responseData = {
      data: leaderboard,
      period: {
        month: currentTime.monthLong,
        year: currentTime.year,
        startDate: startDateISO,
        endDate: endDateISO,
        isMonthlyData: true,
      }
    };

    res.setHeader("Cache-Control", "public, s-maxage=600, stale-while-revalidate=300");
    res.status(200).json(responseData);

  } catch (error: any) {
    console.error("❌ API request failed:", error.message);
    console.error("Status:", error.response?.status);
    
    if (error.response?.data) {
      console.error("API Error Response:", JSON.stringify(error.response.data, null, 2));
    }

    res.status(500).json({
      error: "Failed to fetch leaderboard data",
      message: error.message
    });
  }
}
