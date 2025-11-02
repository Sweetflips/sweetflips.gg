// src/pages/api/LuxdropProxy.ts
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
  [key: string]: any; // Allow any additional fields from API
}

interface LeaderboardEntry {
  username: string;
  wagered: number;
  reward: number;
  rank?: number;
  rawWagered?: number | string;
  rawReward?: number | string;
}

interface CachedResponse {
  data: {
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
  };
  etag: string;
  cachedAt: number;
  expiresAt: number;
  staleAt: number;
}

// In-memory cache: keyed by cacheKey (codes|startDate|endDate)
const cache = new Map<string, CachedResponse>();

// In-flight promise map to coalesce concurrent requests
const inFlightRequests = new Map<string, Promise<CachedResponse>>();

// Cache TTL: 5 minutes fresh, 30 minutes stale window
const FRESH_TTL_MS = 5 * 60 * 1000; // 5 minutes
const STALE_TTL_MS = 30 * 60 * 1000; // 30 minutes

// Generate cache key from request parameters
function getCacheKey(codes: string, startDate: string, endDate: string): string {
  return `${codes}|${startDate}|${endDate}`;
}

// Generate ETag from response data
function generateETag(data: any): string {
  const hash = crypto.createHash("md5").update(JSON.stringify(data)).digest("hex");
  return `W/"${hash}"`;
}

// Parse Retry-After header (can be seconds or HTTP date)
function parseRetryAfter(retryAfter: string | undefined): number {
  if (!retryAfter) return 60; // Default 60 seconds

  const seconds = parseInt(retryAfter, 10);
  if (!isNaN(seconds)) return seconds;

  const date = new Date(retryAfter);
  if (!isNaN(date.getTime())) {
    return Math.max(1, Math.floor((date.getTime() - Date.now()) / 1000));
  }

  return 60; // Fallback
}

// Fetch data from Luxdrop API (with caching and coalescing)
async function fetchLuxdropData(
  codes: string,
  startDateISO: string,
  endDateISO: string,
  periodYear: number,
  periodMonth: number,
  periodLabel: string,
  API_KEY: string,
  proxyAgent: HttpsProxyAgent<string> | null
): Promise<CachedResponse> {
  const cacheKey = getCacheKey(codes, startDateISO, endDateISO);
  const now = Date.now();

  // Check if request is already in flight
  const inFlight = inFlightRequests.get(cacheKey);
  if (inFlight) {
    return inFlight;
  }

  // Check cache for fresh data
  const cached = cache.get(cacheKey);
  if (cached && now < cached.expiresAt) {
    return cached;
  }

  // Create promise for this request
  const fetchPromise = (async (): Promise<CachedResponse> => {
    try {
      const params = {
        codes,
        startDate: startDateISO,
        endDate: endDateISO,
      };

      const LUXDROP_API_BASE_URL = process.env.LUXDROP_API_BASE_URL || "https://api.luxdrop.com/external/affiliates";

      const config: AxiosRequestConfig = {
        method: "get",
        url: LUXDROP_API_BASE_URL,
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

      // Process response data
      const processedData = processApiResponse(
        response.data,
        periodYear,
        periodMonth,
        periodLabel,
        startDateISO,
        endDateISO
      );
      const etag = generateETag(processedData);

      const cachedResponse: CachedResponse = {
        data: processedData,
        etag,
        cachedAt: now,
        expiresAt: now + FRESH_TTL_MS,
        staleAt: now + STALE_TTL_MS,
      };

      cache.set(cacheKey, cachedResponse);
      return cachedResponse;
    } finally {
      // Remove from in-flight map when done
      inFlightRequests.delete(cacheKey);
    }
  })();

  inFlightRequests.set(cacheKey, fetchPromise);
  return fetchPromise;
}

// Process API response into leaderboard format
function processApiResponse(
  apiData: any,
  periodYear: number,
  periodMonth: number,
  periodLabel: string,
  startDateISO: string,
  endDateISO: string
): {
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
} {
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

  const extractUsername = (entry: AffiliateEntry): string => {
    return entry.username || entry.user || entry.name || entry.id || `User${entry.id || 'Unknown'}`;
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
    .slice(0, 100)
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

  // --- Read API and Leaderboard Config from Environment ---
  const API_KEY = process.env.LUXDROP_API_KEY;
  const AFFILIATE_CODE = process.env.LUXDROP_AFFILIATE_CODE || "sweetflips";

  if (!API_KEY) {
    console.error("Server configuration error: Missing Luxdrop API key.");
    return res.status(500).json({ error: "Server-side configuration is incomplete." });
  }

  // Ensure affiliate code is always a string
  const affiliateCode: string = AFFILIATE_CODE;

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
    startDate = DateTime.utc(periodYear, periodMonth, 1, 0, 0, 0);
    endDate = DateTime.utc(periodYear, periodMonth, 15, 23, 59, 59);
    periodLabel = `${DateTime.fromObject({ month: periodMonth, year: periodYear }).toFormat('MMMM')} 1-15, ${periodYear}`;
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
  const now = Date.now();

  // Check ETag for 304 Not Modified
  const ifNoneMatch = req.headers["if-none-match"];
  const cached = cache.get(cacheKey);
  if (cached && ifNoneMatch === cached.etag) {
    res.status(304).end();
    return;
  }

  // Check cache for fresh data
  if (cached && now < cached.expiresAt) {
    res.setHeader("Cache-Control", "public, s-maxage=300, stale-while-revalidate=900, max-age=60");
    res.setHeader("Cache-Tag", "leaderboard,luxdrop");
    res.setHeader("ETag", cached.etag);
    res.status(200).json(cached.data);
    return;
  }

  try {
    // Attempt to fetch fresh data
    const cachedResponse = await fetchLuxdropData(
      affiliateCode,
      startDateISO,
      endDateISO,
      periodYear,
      periodMonth,
      periodLabel,
      API_KEY,
      proxyAgent
    );

    res.setHeader("Cache-Control", "public, s-maxage=300, stale-while-revalidate=900, max-age=60");
    res.setHeader("ETag", cachedResponse.etag);
    res.status(200).json(cachedResponse.data);

  } catch (error: any) {
    const statusCode = error.response?.status || 500;
    const errorMessage = error.response?.data?.message || error.message || "Unknown error";

    // Handle 429 Rate Limit with stale-on-error
    if (statusCode === 429) {
      const retryAfter = parseRetryAfter(error.response?.headers["retry-after"]);

      // Check for stale cache
      if (cached && now < cached.staleAt) {
        const staleData = { ...cached.data, stale: true };
        res.setHeader("Cache-Control", "public, s-maxage=300, stale-while-revalidate=900, max-age=60");
        res.setHeader("ETag", cached.etag);
        res.setHeader("Retry-After", retryAfter.toString());
        res.status(200).json(staleData);
        return;
      }

      // No cache available, return 429
      res.setHeader("Retry-After", retryAfter.toString());
      res.status(429).json({
        error: "Rate limit exceeded",
        message: errorMessage,
        retryAfter,
        timestamp: new Date().toISOString()
      });
      return;
    }

    // Handle 5xx errors with stale-on-error
    if (statusCode >= 500) {
      if (cached && now < cached.staleAt) {
        const staleData = { ...cached.data, stale: true };
        res.setHeader("Cache-Control", "public, s-maxage=300, stale-while-revalidate=900, max-age=60");
        res.setHeader("ETag", cached.etag);
        res.status(200).json(staleData);
        return;
      }
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
