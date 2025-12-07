import { prisma } from "@/lib/prisma";
import type { NextApiRequest, NextApiResponse } from "next";

// Cache TTL: 10 minutes
const CACHE_TTL_MS = 10 * 60 * 1000;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const API_URL = process.env.BASE_RAZED_API_URL as string;
    const REFERRAL_KEY = process.env.AUTH_RAZED as string;
    const REFERRAL_CODE = process.env.RAZED_REFERRAL_CODE || "SweetFlips";

    if (!API_URL || !REFERRAL_KEY) {
      return res.status(500).json({ error: "Missing BASE_RAZED_API_URL or AUTH_RAZED in environment variables" });
    }

    const now = new Date();

    // Special period controls: Start & End date (via .env)
    // Format: YYYY-MM-DD
    const specialStartEnv = process.env.SPECIAL_PERIOD_START_DATE;
    const specialEndEnv = process.env.SPECIAL_PERIOD_END_DATE;
    let SPECIAL_PERIOD_START_DATE: Date | null = null;
    let SPECIAL_PERIOD_END_DATE: Date | null = null;
    if (specialStartEnv && specialEndEnv) {
      const [startYear, startMonth, startDay] = specialStartEnv.split('-').map(Number);
      const [endYear, endMonth, endDay] = specialEndEnv.split('-').map(Number);
      SPECIAL_PERIOD_START_DATE = new Date(Date.UTC(startYear, startMonth - 1, startDay, 0, 0, 0, 0));
      SPECIAL_PERIOD_END_DATE = new Date(Date.UTC(endYear, endMonth - 1, endDay, 23, 59, 59, 999));
    }

    let fromDate: Date;
    let toDate: Date;

    if (
      SPECIAL_PERIOD_START_DATE &&
      SPECIAL_PERIOD_END_DATE &&
      now >= SPECIAL_PERIOD_START_DATE &&
      now <= SPECIAL_PERIOD_END_DATE
    ) {
      fromDate = SPECIAL_PERIOD_START_DATE;
      toDate = SPECIAL_PERIOD_END_DATE;
    } else {
      fromDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 0, 0, 0, 0));
      toDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0, 23, 59, 59, 999));
    }

    const pad = (n: number) => String(n).padStart(2, "0");
    const formatDate = (date: Date) =>
      `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(
        date.getUTCDate()
      )} ${pad(date.getUTCHours())}:${pad(date.getUTCMinutes())}:${pad(date.getUTCSeconds())}`;
    const fromParam = formatDate(fromDate);
    const toParam = formatDate(toDate);
    const cacheKey = `${fromParam}|${toParam}`;

    // 1. Try cache first
    const cached = await prisma.razedLeaderboardCache.findUnique({
      where: { cacheKey },
    });

    if (cached && cached.expiresAt > now) {
      if (process.env.NODE_ENV === "development") {
        console.log(
          `[RazedProxy] Returning cached data from database (expires in ${Math.round(
            (cached.expiresAt.getTime() - now.getTime()) / 1000 / 60
          )} minutes)`
        );
      }
      const cachedData = cached.data as any;
      // Limit to top 20 users
      const limitedData = Array.isArray(cachedData.data)
        ? { ...cachedData, data: cachedData.data.slice(0, 20) }
        : cachedData;

      res.setHeader("Cache-Control", "public, max-age=600, s-maxage=600");
      res.setHeader("Cache-Tag", "leaderboard,razed");
      res.setHeader("Last-Modified", cached.fetchedAt.toUTCString());

      return res.status(200).json(limitedData);
    }

    // 2. Cache miss/expired: Fetch from upstream Razed API
    if (process.env.NODE_ENV === "development") {
      console.log(`[RazedProxy] Cache expired or missing, fetching from API...`);
    }

    const baseUrl = API_URL.includes("?") ? API_URL.split("?")[0] : API_URL;
    const urlWithParams = `${baseUrl}?referral_code=${encodeURIComponent(
      REFERRAL_CODE
    )}&from=${encodeURIComponent(fromParam)}&to=${encodeURIComponent(toParam)}&top=20`;

    const cloudflareCookie = process.env.RAZED_CLOUDFLARE_COOKIE;

    const headers: Record<string, string> = {
      "X-Referral-Key": REFERRAL_KEY,
      Accept: "application/json",
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      "Accept-Language": "en-US,en;q=0.9",
      "Accept-Encoding": "gzip, deflate, br",
      Referer: "https://razed.com/",
      Origin: "https://razed.com",
    };
    if (cloudflareCookie) headers["Cookie"] = cloudflareCookie;

    const response = await fetch(urlWithParams, {
      method: "GET",
      headers,
    });

    if (!response.ok) {
      // fallback: If stale cache exists, return that
      if (cached) {
        if (process.env.NODE_ENV === "development") {
          console.log(
            `[RazedProxy] API error ${response.status}, returning stale cache`
          );
        }
        const cachedData = cached.data as any;
        const limited = Array.isArray(cachedData.data)
          ? { ...cachedData, data: cachedData.data.slice(0, 20), stale: true }
          : { ...cachedData, stale: true };

        res.setHeader("Cache-Control", "public, max-age=600, s-maxage=600");
        res.setHeader("Cache-Tag", "leaderboard,razed");
        res.setHeader("Last-Modified", cached.fetchedAt.toUTCString());
        return res.status(200).json(limited);
      }
      const errorText = await response.text().catch(
        () => "Unable to read error response"
      );
      const isCloudflare =
        errorText.includes("Just a moment") ||
        errorText.includes("cf-browser-verification");
      console.error(
        `[RazedProxy] API error ${response.status}: ${
          isCloudflare ? "Cloudflare challenge" : errorText.substring(0, 200)
        }`
      );

      return res.status(response.status).json({
        error: `Razed API error: ${response.status}`,
        message:
          response.status === 429 || isCloudflare
            ? "Rate limited by Cloudflare. Please try again later."
            : errorText.substring(0, 200),
        isCloudflare,
      });
    }

    const textResponse = await response.text();

    let jsonResponse: any;
    try {
      jsonResponse = JSON.parse(textResponse);
    } catch (err) {
      console.error("[RazedProxy] JSON parse error:", err);
      console.error(
        "[RazedProxy] Response text:",
        textResponse.substring(0, 500)
      );
      // fallback: Return stale cache if possible
      if (cached) {
        const cachedData = cached.data as any;
        const limited = Array.isArray(cachedData.data)
          ? { ...cachedData, data: cachedData.data.slice(0, 20), stale: true }
          : { ...cachedData, stale: true };

        res.setHeader("Cache-Control", "public, max-age=600, s-maxage=600");
        res.setHeader("Cache-Tag", "leaderboard,razed");
        res.setHeader("Last-Modified", cached.fetchedAt.toUTCString());
        return res.status(200).json(limited);
      }
      return res
        .status(500)
        .json({ error: "Invalid JSON response from API" });
    }

    // MASK USERNAMES
    const maskUsername = (username: string) => {
      const len = username.length;
      if (len <= 2) return username;
      if (len <= 4) return username[0] + "*".repeat(len - 2) + username[len - 1];
      return username.slice(0, 2) + "*".repeat(len - 4) + username.slice(-2);
    };

    if (Array.isArray(jsonResponse.data)) {
      jsonResponse.data = jsonResponse.data.slice(0, 20).map((entry: any) => ({
        ...entry,
        username: maskUsername(entry.username),
      }));
    }

    // Store in db cache
    const expiresAt = new Date(now.getTime() + CACHE_TTL_MS);
    await prisma.razedLeaderboardCache.upsert({
      where: { cacheKey },
      create: {
        cacheKey,
        data: jsonResponse as any,
        expiresAt,
        fetchedAt: now,
      },
      update: {
        data: jsonResponse as any,
        expiresAt,
        fetchedAt: now,
      },
    });

    if (process.env.NODE_ENV === "development") {
      console.log(
        `[RazedProxy] Success: ${jsonResponse.data?.length || 0
        } entries processed and cached`
      );
    }

    res.setHeader("Cache-Control", "public, max-age=600, s-maxage=600");
    res.setHeader("Cache-Tag", "leaderboard,razed");
    res.setHeader("Last-Modified", now.toUTCString());

    return res.status(200).json(jsonResponse);
  } catch (error) {
    console.error("RazedProxy error:", error);
    return res.status(500).json({
      error: "Failed to fetch API data",
      message: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString(),
    });
  }
}
