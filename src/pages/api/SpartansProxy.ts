import { prisma } from "@/lib/prisma";
import type { NextApiRequest, NextApiResponse } from "next";

// Cache TTL: 5 minutes (fresher wager data; upstream updates frequently)
const CACHE_TTL_MS = 5 * 60 * 1000;
const SPARTANS_ACTIVE_URL =
  "https://nexus-campaign-hub-production.up.railway.app/affiliates/527938/campaigns/20499/leaderboards/active";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const debugRunId = "run-initial";
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
    // #region agent log
    fetch('http://127.0.0.1:7645/ingest/6a8b2e86-6c53-4ebd-8e5c-d8c843c7eab9',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'d5ed66'},body:JSON.stringify({sessionId:'d5ed66',runId:debugRunId,hypothesisId:'H4',location:'SpartansProxy.ts:33',message:'proxy_entry',data:{isCronRefresh,cacheKey,nowIso:now.toISOString()},timestamp:Date.now()})}).catch(()=>{});
    // #endregion

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
      const topCached = Array.isArray(limitedData.data) && limitedData.data.length > 0 ? limitedData.data[0] : null;
      // #region agent log
      fetch('http://127.0.0.1:7645/ingest/6a8b2e86-6c53-4ebd-8e5c-d8c843c7eab9',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'d5ed66'},body:JSON.stringify({sessionId:'d5ed66',runId:debugRunId,hypothesisId:'H1',location:'SpartansProxy.ts:47',message:'served_from_db_cache',data:{cacheExpiresAt:cached.expiresAt.toISOString(),nowIso:now.toISOString(),topWagered:topCached?.wagered ?? null,topUsername:topCached?.username ?? null,hasStaleFlag:Boolean((limitedData as any).stale)},timestamp:Date.now()})}).catch(()=>{});
      // #endregion

      res.setHeader("Cache-Control", "public, max-age=30, s-maxage=30");
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

    const apiKey = process.env.API_KEY_SWEET_FLIPS || process.env.SPARTANS_API_KEY;
    if (apiKey) {
      headers["x-api-key"] = apiKey;
    }

    // The Spartans /active endpoint manages its own period (startAt/endAt in response).
    // Do NOT append from/to query params -- the API doesn't support them and will error.
    const response = await fetch(API_URL, {
      method: "GET",
      headers,
    });
    // #region agent log
    fetch('http://127.0.0.1:7645/ingest/6a8b2e86-6c53-4ebd-8e5c-d8c843c7eab9',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'d5ed66'},body:JSON.stringify({sessionId:'d5ed66',runId:debugRunId,hypothesisId:'H2',location:'SpartansProxy.ts:80',message:'upstream_response_received',data:{status:response.status,ok:response.ok},timestamp:Date.now()})}).catch(()=>{});
    // #endregion

    if (!response.ok) {
      // fallback: If stale cache exists, return that
      if (cached) {
        const cachedData = cached.data as any;
        const limited = Array.isArray(cachedData.data)
          ? { ...cachedData, data: cachedData.data.slice(0, 25), stale: true }
          : { ...cachedData, stale: true };
        const topFallback = Array.isArray(limited.data) && limited.data.length > 0 ? limited.data[0] : null;
        // #region agent log
        fetch('http://127.0.0.1:7645/ingest/6a8b2e86-6c53-4ebd-8e5c-d8c843c7eab9',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'d5ed66'},body:JSON.stringify({sessionId:'d5ed66',runId:debugRunId,hypothesisId:'H2',location:'SpartansProxy.ts:93',message:'upstream_failed_served_stale_cache',data:{status:response.status,topWagered:topFallback?.wagered ?? null,topUsername:topFallback?.username ?? null},timestamp:Date.now()})}).catch(()=>{});
        // #endregion

        res.setHeader("Cache-Control", "public, max-age=30, s-maxage=30");
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

        res.setHeader("Cache-Control", "public, max-age=30, s-maxage=30");
        res.setHeader("Cache-Tag", "leaderboard,spartans");
        res.setHeader("Last-Modified", cached.fetchedAt.toUTCString());
        return res.status(200).json(limited);
      }
      return res
        .status(500)
        .json({ error: "Invalid JSON response from API" });
    }
    // #region agent log
    fetch('http://127.0.0.1:7645/ingest/6a8b2e86-6c53-4ebd-8e5c-d8c843c7eab9',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'d5ed66'},body:JSON.stringify({sessionId:'d5ed66',runId:debugRunId,hypothesisId:'H3',location:'SpartansProxy.ts:141',message:'upstream_payload_shape',data:{hasEntriesArray:Array.isArray(jsonResponse?.entries),hasDataArray:Array.isArray(jsonResponse?.data),startAt:jsonResponse?.startAt ?? null,endAt:jsonResponse?.endAt ?? null,status:jsonResponse?.status ?? null},timestamp:Date.now()})}).catch(()=>{});
    // #endregion

    // If /active resolves to FINISHED/SCHEDULED, use TAP all-players for current month timeframe.
    // This keeps leaderboard wagers aligned with the live month period.
    if (jsonResponse?.status && jsonResponse.status !== "ACTIVE") {
      const allPlayersUrl = new URL(
        "https://nexus-campaign-hub-production.up.railway.app/affiliates/527938/campaigns/20499/all-players"
      );
      allPlayersUrl.searchParams.set("date_from", fromDate.toISOString());
      allPlayersUrl.searchParams.set("date_to", toDate.toISOString());
      allPlayersUrl.searchParams.set("limit", "50");
      allPlayersUrl.searchParams.set("order_by", "wagered");
      allPlayersUrl.searchParams.set("order_dir", "desc");

      const allPlayersResponse = await fetch(allPlayersUrl.toString(), {
        method: "GET",
        headers,
      });
      // #region agent log
      fetch('http://127.0.0.1:7645/ingest/6a8b2e86-6c53-4ebd-8e5c-d8c843c7eab9',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'d5ed66'},body:JSON.stringify({sessionId:'d5ed66',runId:debugRunId,hypothesisId:'H5',location:'SpartansProxy.ts:166',message:'all_players_attempt',data:{upstreamActiveStatus:jsonResponse.status,httpStatus:allPlayersResponse.status,ok:allPlayersResponse.ok,dateFrom:fromDate.toISOString(),dateTo:toDate.toISOString()},timestamp:Date.now()})}).catch(()=>{});
      // #endregion

      if (allPlayersResponse.ok) {
        const allPlayersJson = await allPlayersResponse.json().catch(() => null);
        if (Array.isArray(allPlayersJson?.items)) {
          jsonResponse = {
            data: allPlayersJson.items.map((p: any) => ({
              username: (p.username || p.registrationId || "Unknown").toString().trim(),
              wagered: Number(p.wagered) || 0,
            })),
            source: "all-players",
          };
        }
      }
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
      jsonResponse = { data: processed };
      const topProcessed = processed.length > 0 ? processed[0] : null;
      // #region agent log
      fetch('http://127.0.0.1:7645/ingest/6a8b2e86-6c53-4ebd-8e5c-d8c843c7eab9',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'d5ed66'},body:JSON.stringify({sessionId:'d5ed66',runId:debugRunId,hypothesisId:'H3',location:'SpartansProxy.ts:170',message:'fresh_processed_payload',data:{entriesCount:processed.length,topWagered:topProcessed?.wagered ?? null,topUsername:topProcessed?.username ?? null},timestamp:Date.now()})}).catch(()=>{});
      // #endregion
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

    // Cron refresh responses must not be cached at edge (different URL + no-cache)
    if (isCronRefresh) {
      res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
    } else {
      res.setHeader("Cache-Control", "public, max-age=30, s-maxage=30");
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
