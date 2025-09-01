// src/pages/api/LuxdropProxy.ts
import axios, { AxiosRequestConfig } from "axios";
import { HttpsProxyAgent } from "https-proxy-agent";
import { DateTime } from "luxon";
import type { NextApiRequest, NextApiResponse } from "next";

// Cache to store previous month's data
let previousMonthCache: { data: any; month: string } | null = null;

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
  
  // For monthly data, we need to fetch TWO datasets:
  // 1. Data up to the end of the previous month (cumulative up to last month)
  // 2. Data up to the end of the current month (cumulative including this month)
  // Then subtract to get this month's data only
  
  const startOfCurrentMonth = currentTime.startOf('month');
  const endOfCurrentMonth = currentTime.endOf('month');
  const endOfPreviousMonth = startOfCurrentMonth.minus({ days: 1 }).endOf('day');
  
  const currentMonthEndISO = endOfCurrentMonth.toISODate();
  const previousMonthEndISO = endOfPreviousMonth.toISODate();
  
  console.log("=== DATE DEBUG (MONTHLY PERIOD) ===");
  console.log("Current time:", currentTime.toISO());
  console.log("Current month:", currentTime.monthLong, currentTime.year);
  console.log("Fetching cumulative data up to:", previousMonthEndISO, "and", currentMonthEndISO);

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
    // Helper function to fetch data up to a specific date
    const fetchDataUpToDate = async (endDate: string) => {
      const params = {
        codes: "sweetflips",
        endDate: endDate, // Only specify endDate to get cumulative data up to this date
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

      console.log(`Fetching data up to ${endDate}...`);
      const response = await axios(config);
      return response.data;
    };

    // Fetch cumulative data up to end of previous month
    let previousMonthData: any[] = [];
    const cacheKey = `${endOfPreviousMonth.year}-${endOfPreviousMonth.month}`;
    
    // Check cache for previous month data
    if (previousMonthCache && previousMonthCache.month === cacheKey) {
      console.log("Using cached previous month data");
      previousMonthData = previousMonthCache.data;
    } else {
      // Only fetch previous month data if current date is not in the first month of data
      // (i.e., if we're not in the first month of the affiliate program)
      if (currentTime.day > 1 || currentTime.month > 1 || currentTime.year > 2025) {
        previousMonthData = await fetchDataUpToDate(previousMonthEndISO);
        // Cache the previous month data
        previousMonthCache = { data: previousMonthData, month: cacheKey };
      }
    }

    // Fetch cumulative data up to end of current month
    const currentMonthCumulativeData = await fetchDataUpToDate(currentMonthEndISO);

    console.log("Previous month cumulative entries:", previousMonthData.length);
    console.log("Current month cumulative entries:", currentMonthCumulativeData.length);

    // Create a map of previous month wagered amounts by username
    const previousWageredMap = new Map<string, number>();
    previousMonthData.forEach((entry: any) => {
      previousWageredMap.set(entry.username, Number(entry.wagered) || 0);
    });

    // Calculate the difference to get this month's wagered amounts
    const monthlyData = currentMonthCumulativeData.map((entry: any) => {
      const username = entry.username;
      const cumulativeWagered = Number(entry.wagered) || 0;
      const previousWagered = previousWageredMap.get(username) || 0;
      const monthlyWagered = cumulativeWagered - previousWagered;

      return {
        username: username || `User${entry.id}`,
        wagered: monthlyWagered,
        // Include cumulative for debugging if needed
        cumulativeTotal: cumulativeWagered,
      };
    });

    // Filter only users with monthly wagers > 0
    const activeMonthlyWagerers = monthlyData.filter(entry => entry.wagered > 0);
    
    console.log("✅ Successfully calculated monthly data!");
    console.log("Active wagerers this month:", activeMonthlyWagerers.length);
    
    const totalMonthlyWagered = activeMonthlyWagerers.reduce((sum, entry) => sum + entry.wagered, 0);
    console.log("Total wagered this month:", "$" + totalMonthlyWagered.toFixed(2));

    // Process the monthly data - sort by wagered amount descending
    const leaderboard = activeMonthlyWagerers
      .map(entry => ({
        username: entry.username,
        wagered: Math.round(entry.wagered * 100) / 100,
        reward: 0, // Calculate rewards based on your reward structure
      }))
      .sort((a, b) => b.wagered - a.wagered)
      .slice(0, 100); // Top 100 for performance

    console.log(`${currentTime.monthLong} ${currentTime.year} leaderboard generated:`);
    console.log("- Total active wagerers:", leaderboard.length);
    console.log("- Top wagerer:", leaderboard[0]?.username, "$" + leaderboard[0]?.wagered);

    // Include metadata about the current period
    const responseData = {
      data: leaderboard,
      period: {
        month: currentTime.monthLong,
        year: currentTime.year,
        startDate: startOfCurrentMonth.toISODate(),
        endDate: endOfCurrentMonth.toISODate(),
        isMonthlyData: true, // Indicate this is monthly-specific data
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

    // Return error when API fails
    res.status(500).json({
      error: "Failed to fetch leaderboard data",
      message: error.message
    });
  }
}
