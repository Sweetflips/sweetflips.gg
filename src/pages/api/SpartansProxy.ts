import { prisma } from "@/lib/prisma";
import type { NextApiRequest, NextApiResponse } from "next";

// Cache TTL: 15 minutes (matches Spartans source update frequency)
const CACHE_TTL_MS = 15 * 60 * 1000;
const SPARTANS_ACTIVE_URL =
  "https://nexus-campaign-hub-production.up.railway.app/affiliates/527938/campaigns/20499/leaderboards/active";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Force Spartans source to affiliateId=527938 + campaignId=20499.
    const API_URL = SPARTANS_ACTIVE_URL;

    const now = new Date();

    // Cron bypass: when called by refresh-leaderboards with cron_refresh=1 + Bearer token,
    // skip cache and force fetch from upstream (avoids edge cache serving stale data)
    const isCronRefresh =
      req.query.cron_refresh === "1" &&
      req.headers.authorization === `Bearer ${process.env.CRON_SECRET}`;

    // Monthly period: 1st of current month 00:00 UTC → last day 23:59:59 UTC
    const fromDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 0, 0, 0, 0));
    const toDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0, 23, 59, 59, 999));

    const pad = (n: number) => String(n).padStart(2, "0");
    const formatDate = (date: Date) =>
      `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(
        date.getUTCDate()
      )} ${pad(date.getUTCHours())}:${pad(date.getUTCMinutes())}:${pad(date.getUTCSeconds())}`;
    const fromParam = formatDate(fromDate);
    const toParam = formatDate(toDate);
    const cacheKey = `spartans|527938|20499|${fromParam}|${toParam}`;

    // 1. Try cache first (skip when cron forces refresh)
    const cached = await prisma.spartansLeaderboardCache.findUnique({
      where: { cacheKey },
    });

    if (!isCronRefresh && cached && cached.expiresAt > now) {
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
    const headers: Record<string, string> = {
      Accept: "application/json",
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      "Accept-Language": "en-US,en;q=0.9",
      "Accept-Encoding": "gzip, deflate, br",
    };

    const apiKey = process.env.SPARTANS_API_KEY;
    if (apiKey) {
      headers["x-api-key"] = apiKey;
    }

    const url = new URL(API_URL);
    url.searchParams.set("from", fromParam);
    url.searchParams.set("to", toParam);

    console.log(`[SpartansProxy] Fetching: ${url.toString()} (period: ${fromParam} → ${toParam})`);

    const response = await fetch(url.toString(), {
      method: "GET",
      headers,
    });

    if (!response.ok) {
      // fallback: If stale cache exists, return that
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
      const extractWagered = (e: any) => {
        const value = e.wagered || e.wager || e.amount || e.total || 0;
        if (typeof value === "string") {
          const cleaned = value.replace(/[$,\s]/g, "");
          const parsed = parseFloat(cleaned);
          return Number.isFinite(parsed) ? parsed : 0;
        }
        return Number(value) || 0;
      };
      const getRawUsername = (e: any) =>
        (e.username || e.name || e.player || "Unknown").toString().trim();

      const processed = leaderboardData
        .map((entry: any) => ({
          username: getRawUsername(entry),
          wagered: extractWagered(entry),
        }))
        .sort((a, b) => b.wagered - a.wagered)
        .slice(0, 25)
        .map((entry) => ({
          username: maskUsername(entry.username),
          wagered: entry.wagered,
        }));
      jsonResponse = {
        data: processed,
        period: { from: fromParam, to: toParam },
      };
    }

    console.log(`[SpartansProxy] Processed ${Array.isArray(jsonResponse.data) ? jsonResponse.data.length : 0} entries for period ${fromParam} → ${toParam}`);

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
