// src/pages/api/LuxdropProxy.ts
import { prisma } from "@/lib/prisma";
import axios, { AxiosRequestConfig } from "axios";
import crypto from "crypto";
import { HttpsProxyAgent } from "https-proxy-agent";
import { DateTime } from "luxon";
import type { NextApiRequest, NextApiResponse } from "next";

// Type definitions
interface AffiliateEntry {
  id?: string;
  username?: string;
  user?: string;
  name?: string;
  wagered?: number | string;
  wagered_amount?: number | string;
  wager?: number | string;
  amount?: number | string;
  [key: string]: any;
}

interface LeaderboardEntry {
  username: string;
  wagered: number;
  reward: number;
  rank?: number;
  rawWagered?: number | string;
  rawReward?: number | string;
}

interface LeaderboardData {
  data: LeaderboardEntry[];
  period: {
    month: string;
    year: number;
    period: string;
    startDate: string;
    endDate: string;
    note: string;
  };
  stale?: boolean;
}

// Cache TTL: 10 minutes
const CACHE_TTL_MS = 10 * 60 * 1000;

// Generate cache key from request parameters
function getCacheKey(codes: string, startDate: string, endDate: string): string {
  return `${codes}|${startDate}|${endDate}`;
}

// Parse Retry-After header (can be seconds or HTTP date)
function parseRetryAfter(retryAfter: string | undefined): number {
  if (!retryAfter) return 60;

  const seconds = parseInt(retryAfter, 10);
  if (!isNaN(seconds)) return seconds;

  const date = new Date(retryAfter);
  if (!isNaN(date.getTime())) {
    return Math.max(1, Math.floor((date.getTime() - Date.now()) / 1000));
  }

  return 60;
}

// Process API response into leaderboard format
function processApiResponse(
  apiData: any,
  periodYear: number,
  periodMonth: number,
  periodLabel: string,
  startDateISO: string,
  endDateISO: string,
  maskUsernames: boolean = true
): LeaderboardData {
  let monthlyData: AffiliateEntry[];

  if (Array.isArray(apiData)) {
    monthlyData = apiData;
  } else if (typeof apiData === 'object' && apiData !== null) {
    monthlyData = apiData.data || apiData.results || apiData.items || apiData.affiliates || [];
    if (!Array.isArray(monthlyData)) {
      throw new Error(`API response structure unexpected. Expected array or object with array property, got: ${typeof apiData}`);
    }
  } else {
    throw new Error(`API response is not an array or object. Got: ${typeof apiData}`);
  }

  // 🔥 Mask usernames for privacy
  const maskUsername = (username: string) => {
    const len = username.length;
    if (len <= 2) return username;
    if (len <= 4) return username[0] + '*'.repeat(len - 2) + username[len - 1];
    return username.slice(0, 2) + '*'.repeat(len - 4) + username.slice(-2);
  };

  const extractUsername = (entry: AffiliateEntry): string => {
    const rawUsername = entry.username || entry.user || entry.name || entry.id || `User${entry.id || 'Unknown'}`;
    return maskUsernames ? maskUsername(rawUsername) : rawUsername;
  };

  const extractWagered = (entry: AffiliateEntry): number => {
    const wageredValue = entry.wagered || entry.wagered_amount || entry.wager || entry.amount || 0;
    return Number(wageredValue) || 0;
  };

  const activeWagerers = monthlyData.filter((entry: AffiliateEntry) => {
    const wagered = extractWagered(entry);
    return wagered > 0;
  });

  const leaderboard: LeaderboardEntry[] = activeWagerers
    .map((entry: AffiliateEntry, index: number) => {
      const username = extractUsername(entry);
      const rawWagered = entry.wagered || entry.wagered_amount || entry.wager || entry.amount || 0;
      const wagered = Math.round((extractWagered(entry)) * 100) / 100;

      return {
        username,
        wagered,
        reward: 0,
        rank: index + 1,
        rawWagered,
        rawReward: entry.reward || undefined,
      };
    })
    .sort((a, b) => b.wagered - a.wagered)
    .slice(0, 20) // Limit to top 20 users
    .map((entry, index) => ({
      ...entry,
      rank: index + 1,
    }));

  return {
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
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  // --- Read API and Leaderboard Config from Environment (trim to strip any \r\n from env values) ---
  const API_KEY = process.env.LUXDROP_API_KEY?.trim();
  const AFFILIATE_CODE = (process.env.LUXDROP_AFFILIATE_CODE || "sweetflips").trim();

  if (!API_KEY) {
    console.error("Server configuration error: Missing Luxdrop API key.");
    return res.status(500).json({ error: "Server-side configuration is incomplete." });
  }

  const affiliateCode: string = AFFILIATE_CODE;

  // --- Read Proxy Details from Environment (trim to strip any \r\n from env values) ---
  const proxyHost = process.env.PROXY_HOST?.trim();
  const proxyPortString = process.env.PROXY_PORT?.trim();
  const proxyUsername = process.env.PROXY_USERNAME?.trim();
  const proxyPassword = process.env.PROXY_PASSWORD?.trim();

  let proxyPort: number | undefined = undefined;
  if (proxyPortString) {
    const parsedPort = parseInt(proxyPortString, 10);
    if (!isNaN(parsedPort)) {
      proxyPort = parsedPort;
    }
  }

  const now = DateTime.utc();
  let startDate: DateTime;
  let endDate: DateTime;
  let periodLabel: string;
  let periodYear: number;
  let periodMonth: number;

  const queryStartDate = req.query.startDate as string | undefined;
  const queryEndDate = req.query.endDate as string | undefined;

  if (queryStartDate && queryEndDate) {
    const parsedStart = DateTime.fromISO(queryStartDate, { zone: 'utc' });
    const parsedEnd = DateTime.fromISO(queryEndDate, { zone: 'utc' });

    if (parsedStart.isValid && parsedEnd.isValid) {
      startDate = parsedStart.startOf('day');
      endDate = parsedEnd.set({ hour: 23, minute: 59, second: 59 });
      periodYear = endDate.year;
      periodMonth = endDate.month;
      periodLabel = `${startDate.toFormat("MMM d")} - ${endDate.toFormat("MMM d, yyyy")}`;
    } else {
      return res.status(400).json({ error: "Invalid date format in query parameters" });
    }
  } else {
    const baseStartDate = DateTime.utc(2025, 12, 1, 0, 0, 0);
    const periodLengthDays = 14;

    const daysSinceStart = Math.floor(now.diff(baseStartDate, "days").days);
    const periodNumber = Math.floor(daysSinceStart / periodLengthDays);

    startDate = baseStartDate.plus({ days: periodNumber * periodLengthDays });
    endDate = startDate.plus({ days: periodLengthDays - 1 }).set({ hour: 23, minute: 59, second: 59 });
    periodYear = endDate.year;
    periodMonth = endDate.month;
    periodLabel = `${startDate.toFormat("MMM d")} - ${endDate.toFormat("MMM d, yyyy")}`;
  }

  const startDateISO = startDate.toISODate();
  const endDateISO = endDate.toISODate();

  if (!startDateISO || !endDateISO) {
    return res.status(500).json({ error: "Failed to generate date range" });
  }

  // Create proxy agent if configured
  let proxyAgent: HttpsProxyAgent<string> | null = null;
  if (proxyHost && proxyPort) {
    let proxyUrl: string;
    if (proxyUsername && proxyPassword) {
      proxyUrl = `http://${proxyUsername}:${proxyPassword}@${proxyHost}:${proxyPort}`;
    } else {
      proxyUrl = `http://${proxyHost}:${proxyPort}`;
    }
    proxyAgent = new HttpsProxyAgent(proxyUrl);
  }

  const cacheKey = getCacheKey(affiliateCode, startDateISO, endDateISO);
  const currentTime = new Date();

  // 🔥 Mask usernames for privacy (used when returning cached data)
  const maskUsername = (username: string) => {
    const len = username.length;
    if (len <= 2) return username;
    if (len <= 4) return username[0] + '*'.repeat(len - 2) + username[len - 1];
    return username.slice(0, 2) + '*'.repeat(len - 4) + username.slice(-2);
  };

  // Check database cache first
  let cached: Awaited<ReturnType<typeof prisma.luxdropLeaderboardCache.findUnique>> = null;
  try {
    cached = await prisma.luxdropLeaderboardCache.findUnique({
      where: {
        cacheKey: cacheKey,
      },
    });
  } catch (dbError: any) {
    console.error(`[LuxdropProxy] Database cache lookup failed: ${dbError.message}`);
    // Continue without cache — will fetch fresh from API
  }

  // If cache exists and is still fresh, return from database
  if (cached && cached.expiresAt > currentTime) {
    // Return cached data (usernames should already be masked from when data was stored)
    // But mask again to handle any old cached data with unmasked usernames
    const cachedData = cached.data as unknown as LeaderboardData;
    const maskedData = {
      ...cachedData,
      data: cachedData.data
        .slice(0, 20) // Limit to top 20 users
        .map(entry => {
          const username = entry.username.includes('*') ? entry.username : maskUsername(entry.username);
          return { ...entry, username };
        }),
    };

    // Always compute a proper MD5 ETag from the actual content (replaces any old broken ETags)
    const contentEtag = `W/"${crypto.createHash("md5").update(JSON.stringify(maskedData)).digest("hex")}"`;

    console.log(`[LuxdropProxy] Cache hit (expires in ${Math.round((cached.expiresAt.getTime() - currentTime.getTime()) / 1000)}s, key=${cacheKey}, etag=${contentEtag})`);

    res.setHeader("Cache-Control", "public, s-maxage=300, stale-while-revalidate=900, max-age=60");
    res.setHeader("Cache-Tag", "leaderboard,luxdrop");
    res.setHeader("ETag", contentEtag);

    // Check ETag for 304 Not Modified
    const ifNoneMatch = req.headers["if-none-match"];
    if (ifNoneMatch === contentEtag) {
      res.status(304).end();
      return;
    }

    res.status(200).json(maskedData);
    return;
  }

  // Cache expired or missing - fetch from API
  console.log(`[LuxdropProxy] Cache ${cached ? 'expired' : 'miss'}, fetching fresh from API (key=${cacheKey})`);

  try {
    const params = {
      codes: affiliateCode,
      startDate: startDateISO,
      endDate: endDateISO,
    };

    const LUXDROP_API_BASE_URL = (process.env.LUXDROP_API_BASE_URL || "https://api.luxdrop.com/external/affiliates").trim();

    const config: AxiosRequestConfig = {
      method: "get",
      url: LUXDROP_API_BASE_URL,
      params: params,
      timeout: 30000,
      proxy: false, // Prevent axios from auto-detecting env proxy vars — we use our own HttpsProxyAgent
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

    // Process response data (mask usernames before storing)
    const processedData = processApiResponse(
      response.data,
      periodYear,
      periodMonth,
      periodLabel,
      startDateISO,
      endDateISO,
      true // Always mask usernames before storing in cache
    );

    // Store in database cache
    const expiresAt = new Date(currentTime.getTime() + CACHE_TTL_MS);
    const etag = `W/"${crypto.createHash("md5").update(JSON.stringify(processedData)).digest("hex")}"`;

    await prisma.luxdropLeaderboardCache.upsert({
      where: {
        cacheKey: cacheKey,
      },
      create: {
        cacheKey: cacheKey,
        data: processedData as any,
        period: {
          month: processedData.period.month,
          year: processedData.period.year,
          period: processedData.period.period,
          startDate: processedData.period.startDate,
          endDate: processedData.period.endDate,
          note: processedData.period.note,
        },
        etag: etag,
        expiresAt: expiresAt,
        fetchedAt: currentTime,
      },
      update: {
        data: processedData as any,
        period: {
          month: processedData.period.month,
          year: processedData.period.year,
          period: processedData.period.period,
          startDate: processedData.period.startDate,
          endDate: processedData.period.endDate,
          note: processedData.period.note,
        },
        etag: etag,
        expiresAt: expiresAt,
        fetchedAt: currentTime,
      },
    });

    console.log(`[LuxdropProxy] Fresh data: ${processedData.data.length} entries cached (etag=${etag})`);

    res.setHeader("Cache-Control", "public, s-maxage=300, stale-while-revalidate=900, max-age=60");
    res.setHeader("Cache-Tag", "leaderboard,luxdrop");
    res.setHeader("ETag", etag);
    res.status(200).json(processedData);

  } catch (error: any) {
    const statusCode = error.response?.status || 500;
    const errorMessage = error.response?.data?.message || error.message || "Unknown error";

    // If API fails but we have stale cache, return stale cache
    if (cached) {
      console.warn(`[LuxdropProxy] API error ${statusCode}: ${errorMessage} — returning stale cache (key=${cacheKey})`);
      const staleData = cached.data as unknown as LeaderboardData;
      const maskedStaleData = {
        ...staleData,
        data: staleData.data
          .slice(0, 20) // Limit to top 20 users
          .map(entry => {
            // Only mask if username doesn't already contain asterisks (to avoid double-masking)
            const username = entry.username.includes('*') ? entry.username : maskUsername(entry.username);
            return {
              ...entry,
              username,
            };
          }),
        stale: true,
      };
      // Short cache on stale responses so fresh data is picked up sooner
      res.setHeader("Cache-Control", "public, s-maxage=60, stale-while-revalidate=120, max-age=30");
      res.setHeader("Cache-Tag", "leaderboard,luxdrop");
      // Generate a fresh ETag for stale data (don't re-use old ETags that may be in broken format)
      const staleEtag = `W/"${crypto.createHash("md5").update(JSON.stringify(maskedStaleData)).digest("hex")}"`;
      res.setHeader("ETag", staleEtag);
      res.status(200).json(maskedStaleData);
      return;
    }

    // Handle 429 Rate Limit
    if (statusCode === 429) {
      const retryAfter = parseRetryAfter(error.response?.headers["retry-after"]);
      res.setHeader("Retry-After", retryAfter.toString());
      res.status(429).json({
        error: "Rate limit exceeded",
        message: errorMessage,
        retryAfter,
        timestamp: new Date().toISOString()
      });
      return;
    }

    // Log error
    if (error.response) {
      console.error(`[LuxdropProxy] API error ${statusCode}: ${errorMessage}`);
    } else if (error.request) {
      console.error(`[LuxdropProxy] Request failed: ${error.message}`);
    } else {
      console.error(`[LuxdropProxy] Error: ${error.message}`);
    }

    res.status(statusCode).json({
      error: "Failed to fetch leaderboard data",
      message: errorMessage,
      details: error.response?.data || null,
      timestamp: new Date().toISOString()
    });
  }
}
