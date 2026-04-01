import type { NextApiRequest, NextApiResponse } from "next";

const CSGOWIN_API_URL = "https://api.csgowin.com/api/leaderboard/sweetflips";
const CSGOWIN_API_KEY = "386eb60150";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const isCronRefresh =
      req.query.cron_refresh === "1" &&
      req.headers.authorization === `Bearer ${process.env.CRON_SECRET}`;

    const response = await fetch(CSGOWIN_API_URL, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "x-apikey": CSGOWIN_API_KEY,
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => "Unable to read error response");
      console.error(`[CsgowinProxy] API error ${response.status}: ${errorText.substring(0, 200)}`);
      return res.status(response.status).json({
        error: `CSGOWIN API error: ${response.status}`,
        message: errorText.substring(0, 200),
      });
    }

    const textResponse = await response.text();

    let jsonResponse: any;
    try {
      jsonResponse = JSON.parse(textResponse);
    } catch (err) {
      console.error("[CsgowinProxy] JSON parse error:", err);
      return res.status(500).json({ error: "Invalid JSON response from API" });
    }

    const maskUsername = (username: string) => {
      const len = username.length;
      if (len <= 2) return username;
      if (len <= 4) return username[0] + "*".repeat(len - 2) + username[len - 1];
      return username.slice(0, 2) + "*".repeat(len - 4) + username.slice(-2);
    };

    const activeLeaderboard = Array.isArray(jsonResponse.leaderboards)
      ? jsonResponse.leaderboards.find((lb: any) => lb.active) || jsonResponse.leaderboards[0]
      : null;

    if (!activeLeaderboard) {
      return res.status(200).json({ data: [], dateEnd: null });
    }

    const users = Array.isArray(activeLeaderboard.users) ? activeLeaderboard.users : [];

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

    const processed = users
      .map((entry: any) => ({
        username: getRawUsername(entry),
        wagered: extractWagered(entry),
      }))
      .sort((a: any, b: any) => b.wagered - a.wagered)
      .slice(0, 10)
      .map((entry: any) => ({
        username: maskUsername(entry.username),
        wagered: entry.wagered,
      }));

    jsonResponse = {
      data: processed,
      dateEnd: activeLeaderboard.dateEnd || null,
    };

    if (isCronRefresh) {
      res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
    } else {
      res.setHeader("Cache-Control", "public, max-age=30, s-maxage=30");
    }
    res.setHeader("Cache-Tag", "leaderboard,csgowin");
    res.setHeader("Last-Modified", new Date().toUTCString());

    return res.status(200).json(jsonResponse);
  } catch (error) {
    console.error("CsgowinProxy error:", error);
    return res.status(500).json({
      error: "Failed to fetch API data",
      message: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString(),
    });
  }
}
