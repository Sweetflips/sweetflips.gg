import type { NextApiRequest, NextApiResponse } from "next";

const SPARTANS_ACTIVE_URL =
  "https://nexus-campaign-hub-production.up.railway.app/affiliates/527938/campaigns/20499/leaderboards/active";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const API_URL = SPARTANS_ACTIVE_URL;

    const now = new Date();

    const isCronRefresh =
      req.query.cron_refresh === "1" &&
      req.headers.authorization === `Bearer ${process.env.CRON_SECRET}`;

    // Monthly period: 1st of current month 00:00 UTC → last day 23:59:59 UTC
    const fromDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 0, 0, 0, 0));
    const toDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0, 23, 59, 59, 999));

    // Fetch from upstream Spartans API
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

    // The Spartans /active endpoint manages its own period (startAt/endAt in response).
    // Do NOT append from/to query params -- the API doesn't support them and will error.
    const response = await fetch(API_URL, {
      method: "GET",
      headers,
    });

    if (!response.ok) {
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
      return res
        .status(500)
        .json({ error: "Invalid JSON response from API" });
    }
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
      const responseSource = jsonResponse?.source || "active-leaderboard";
      jsonResponse = { data: processed, source: responseSource };
    }

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
