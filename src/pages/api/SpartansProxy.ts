import { prisma } from "@/lib/prisma";
import type { NextApiRequest, NextApiResponse } from "next";

// Cache TTL: 10 minutes
const CACHE_TTL_MS = 10 * 60 * 1000;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Spartans API URL - path-based structure with affiliate and campaign IDs
    const API_URL = process.env.BASE_SPARTANS_API_URL as string;

    if (!API_URL) {
      return res.status(500).json({ error: "Missing BASE_SPARTANS_API_URL in environment variables" });
    }

    const now = new Date();

    // Cron bypass: when called by refresh-leaderboards with cron_refresh=1 + Bearer token,
    // skip cache and force fetch from upstream (avoids edge cache serving stale data)
    const isCronRefresh =
      req.query.cron_refresh === "1" &&
      req.headers.authorization === `Bearer ${process.env.CRON_SECRET}`;

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
    const cacheKey = `spartans|${fromParam}|${toParam}`;

    // 1. Try cache first (skip when cron forces refresh)
    const cached = await prisma.spartansLeaderboardCache.findUnique({
      where: { cacheKey },
    });

    if (!isCronRefresh && cached && cached.expiresAt > now) {
      if (process.env.NODE_ENV === "development") {
        console.log(
          `[SpartansProxy] Returning cached data from database (expires in ${Math.round(
            (cached.expiresAt.getTime() - now.getTime()) / 1000 / 60
          )} minutes)`
        );
      }
      const cachedData = cached.data as any;
      // Limit to top 25 users
      const limitedData = Array.isArray(cachedData.data)
        ? { ...cachedData, data: cachedData.data.slice(0, 25) }
        : cachedData;

      res.setHeader("Cache-Control", "public, max-age=60, s-maxage=60");
      res.setHeader("Cache-Tag", "leaderboard,spartans");
      res.setHeader("Last-Modified", cached.fetchedAt.toUTCString());

      return res.status(200).json(limitedData);
    }

    // 2. Cache miss/expired: Fetch from upstream Spartans API
    if (process.env.NODE_ENV === "development") {
      console.log(`[SpartansProxy] Cache expired or missing, fetching from API...`);
    }

    // Spartans API is a direct endpoint - no query params needed
    const headers: Record<string, string> = {
      Accept: "application/json",
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      "Accept-Language": "en-US,en;q=0.9",
      "Accept-Encoding": "gzip, deflate, br",
    };

    // Add x-api-key header for authentication
    const apiKey = process.env.SPARTANS_API_KEY;
    if (apiKey) {
      headers["x-api-key"] = apiKey;
    }

    const response = await fetch(API_URL, {
      method: "GET",
      headers,
    });

    if (!response.ok) {
      // fallback: If stale cache exists, return that
      if (cached) {
        if (process.env.NODE_ENV === "development") {
          console.log(
            `[SpartansProxy] API error ${response.status}, returning stale cache`
          );
        }
        const cachedData = cached.data as any;
        const limited = Array.isArray(cachedData.data)
          ? { ...cachedData, data: cachedData.data.slice(0, 25), stale: true }
          : { ...cachedData, stale: true };

        res.setHeader("Cache-Control", "public, max-age=60, s-maxage=60");
        res.setHeader("Cache-Tag", "leaderboard,spartans");
        res.setHeader("Last-Modified", cached.fetchedAt.toUTCString());
        return res.status(200).json(limited);
      }
      const errorText = await response.text().catch(
        () => "Unable to read error response"
      );
      console.error(
        `[SpartansProxy] API error ${response.status}: ${errorText.substring(0, 200)}`
      );

      return res.status(response.status).json({
        error: `Spartans API error: ${response.status}`,
        message: errorText.substring(0, 200),
      });
    }

    const textResponse = await response.text();

    let jsonResponse: any;
    try {
      jsonResponse = JSON.parse(textResponse);
    } catch (err) {
      console.error("[SpartansProxy] JSON parse error:", err);
      console.error(
        "[SpartansProxy] Response text:",
        textResponse.substring(0, 500)
      );
      // fallback: Return stale cache if possible
      if (cached) {
        const cachedData = cached.data as any;
        const limited = Array.isArray(cachedData.data)
          ? { ...cachedData, data: cachedData.data.slice(0, 25), stale: true }
          : { ...cachedData, stale: true };

        res.setHeader("Cache-Control", "public, max-age=60, s-maxage=60");
        res.setHeader("Cache-Tag", "leaderboard,spartans");
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

    // Handle different API response structures
    // The new API might return data in a different format
    let leaderboardData = jsonResponse.data || jsonResponse.leaderboard || jsonResponse.entries || jsonResponse;

    if (Array.isArray(leaderboardData)) {
      const extractWagered = (e: any) =>
        Number(e.wagered || e.wager || e.amount || e.total || 0) || 0;
      const getRawUsername = (e: any) =>
        (e.username || e.name || e.player || "Unknown").toString().trim();
      const canonicalize = (u: string) => {
        const lower = u.toLowerCase();
        if (lower === "killcam") return "killacamx";
        return u;
      };

      const byCanonical = new Map<string, number>();
      for (const entry of leaderboardData) {
        const raw = getRawUsername(entry);
        const canonical = canonicalize(raw);
        const wagered = extractWagered(entry);
        byCanonical.set(canonical, (byCanonical.get(canonical) ?? 0) + wagered);
      }

      const aggregated = Array.from(byCanonical.entries())
        .map(([username, wagered]) => ({ username, wagered }))
        .sort((a, b) => b.wagered - a.wagered)
        .slice(0, 25)
        .map(({ username, wagered }) => ({
          username: maskUsername(username),
          wagered,
        }));
      jsonResponse = { data: aggregated };
    }

    // Store in db cache
    const expiresAt = new Date(now.getTime() + CACHE_TTL_MS);
    await prisma.spartansLeaderboardCache.upsert({
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
        `[SpartansProxy] Success: ${jsonResponse.data?.length || 0
        } entries processed and cached`
      );
    }

    // Cron refresh responses must not be cached at edge (different URL + no-cache)
    if (isCronRefresh) {
      res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
    } else {
      res.setHeader("Cache-Control", "public, max-age=60, s-maxage=60");
    }
    res.setHeader("Cache-Tag", "leaderboard,spartans");
    res.setHeader("Last-Modified", now.toUTCString());

    return res.status(200).json(jsonResponse);
  } catch (error) {
    console.error("SpartansProxy error:", error);
    return res.status(500).json({
      error: "Failed to fetch API data",
      message: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString(),
    });
  }
}
