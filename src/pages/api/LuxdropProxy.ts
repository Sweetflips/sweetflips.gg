// src/pages/api/LuxdropProxy.ts
import { prisma } from "@/lib/prisma";
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

  // Define the period: October 16-31, 2025
  const startDate = DateTime.utc(2025, 10, 16, 0, 0, 0);
  const endDate = DateTime.utc(2025, 10, 31, 23, 59, 59);
  const periodLabel = "16-31okt 2025";
  const startDateISO = startDate.toFormat('yyyy-MM-dd');
  const endDateISO = endDate.toFormat('yyyy-MM-dd');

  // First, try to get cached data
  try {
    const cachedData = await prisma.luxdropCache.findUnique({
      where: {
        period_startDate_endDate: {
          period: periodLabel,
          startDate: startDateISO,
          endDate: endDateISO,
        },
      },
    });

    if (cachedData) {
      const cacheAge = Date.now() - cachedData.createdAt.getTime();
      const cacheAgeMinutes = cacheAge / (1000 * 60);

      console.log(`📦 Serving cached data (age: ${cacheAgeMinutes.toFixed(1)} minutes)`);

      res.setHeader("Cache-Control", "public, s-maxage=300, stale-while-revalidate=600");
      res.setHeader("X-Data-Source", "cache");
      res.setHeader("X-Cache-Age-Minutes", cacheAgeMinutes.toString());

      return res.status(200).json(cachedData.data);
    }
  } catch (error: any) {
    // Check if it's a table not found error
    if (error.code === 'P2021' && error.meta?.table === 'public.LuxdropCache') {
      console.log("⚠️ LuxdropCache table not found - skipping cache lookup");
    } else {
      console.warn("⚠️ Failed to fetch cached data:", error);
    }
  }

  console.log("🔄 No cached data found, fetching from API...");

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

  const currentTime = DateTime.utc();

  console.log("=== DATE DEBUG (FIXED PERIOD) ===");
  console.log("Current time:", currentTime.toISO());
  console.log("Fixed period:", periodLabel);
  console.log("Period start UTC:", startDate.toISO());
  console.log("Period end UTC:", endDate.toISO());
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

    console.log("=== API REQUEST ===");
    console.log("URL:", config.url);
    console.log("Params:", JSON.stringify(params, null, 2));

    const response = await axios(config);
    const monthlyData: AffiliateEntry[] = response.data;

    console.log("✅ Successfully received data from Luxdrop API!");
    console.log("Entries for current period:", Array.isArray(monthlyData) ? monthlyData.length : 'N/A');

    if (!Array.isArray(monthlyData)) {
      throw new Error("API response is not an array");
    }

    // Filter only users with wagers > 0 for this bi-weekly period
    const activeWagerers = monthlyData.filter((entry: AffiliateEntry) => {
      const wagered = Number(entry.wagered) || 0;
      return wagered > 0;
    });

    console.log("Active wagerers in current period:", activeWagerers.length);

    const totalWagered = activeWagerers.reduce((sum: number, entry: AffiliateEntry) => {
      return sum + (Number(entry.wagered) || 0);
    }, 0);

    console.log("Total wagered in current period:", "$" + totalWagered.toFixed(2));

    // Process the bi-weekly data - sort by wagered amount descending
    const leaderboard: LeaderboardEntry[] = activeWagerers
      .map((entry: AffiliateEntry) => ({
        username: entry.username || `User${entry.id}`,
        wagered: Math.round((Number(entry.wagered) || 0) * 100) / 100,
        reward: 0,
      }))
      .sort((a, b) => b.wagered - a.wagered)
      .slice(0, 100); // Top 100

    console.log(`${periodLabel} leaderboard generated:`);
    console.log("- Total active wagerers:", leaderboard.length);
    if (leaderboard.length > 0) {
      console.log("- Top wagerer:", leaderboard[0].username, "$" + leaderboard[0].wagered);
    }

    const responseData = {
      data: leaderboard,
      period: {
        month: "October",
        year: 2025,
        period: periodLabel,
        startDate: startDateISO,
        endDate: endDateISO,
        note: `Leaderboard data from ${startDateISO} to ${endDateISO}`
      }
    };

    res.setHeader("Cache-Control", "public, s-maxage=600, stale-while-revalidate=300");
    res.setHeader("X-Data-Source", "api");
    res.status(200).json(responseData);

  } catch (error: any) {
    console.error("❌ API request failed:", error.message);
    console.error("Status:", error.response?.status);

    if (error.response?.data) {
      console.error("API Error Response:", JSON.stringify(error.response.data, null, 2));
    }

    // If rate limited, try to serve stale cached data
    if (error.response?.status === 429) {
      console.log("🔄 Rate limited, attempting to serve stale cached data...");

      try {
        const staleCachedData = await prisma.luxdropCache.findUnique({
          where: {
            period_startDate_endDate: {
              period: periodLabel,
              startDate: startDateISO,
              endDate: endDateISO,
            },
          },
        });

        if (staleCachedData) {
          const cacheAge = Date.now() - staleCachedData.createdAt.getTime();
          const cacheAgeMinutes = cacheAge / (1000 * 60);

          console.log(`📦 Serving stale cached data (age: ${cacheAgeMinutes.toFixed(1)} minutes)`);

          res.setHeader("Cache-Control", "public, s-maxage=60, stale-while-revalidate=300");
          res.setHeader("X-Data-Source", "stale-cache");
          res.setHeader("X-Cache-Age-Minutes", cacheAgeMinutes.toString());
          res.setHeader("X-Rate-Limited", "true");

          return res.status(200).json(staleCachedData.data);
        }
      } catch (cacheError: any) {
        // Check if it's a table not found error
        if (cacheError.code === 'P2021' && cacheError.meta?.table === 'public.LuxdropCache') {
          console.log("⚠️ LuxdropCache table not found - skipping stale cache lookup");
        } else {
          console.warn("⚠️ Failed to fetch stale cached data:", cacheError);
        }
      }
    }

    // Return error if no fallback available
    res.status(500).json({
      error: "Failed to fetch leaderboard data",
      message: error.message,
      details: error.response?.data || null,
      rateLimited: error.response?.status === 429
    });
  }
}
