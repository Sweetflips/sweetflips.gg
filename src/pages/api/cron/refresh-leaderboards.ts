// src/pages/api/cron/refresh-leaderboards.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { getBaseUrl } from "@/lib/getBaseUrl";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Verify the request is from Vercel Cron
  const authHeader = req.headers.authorization;
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const baseUrl = getBaseUrl();

  const results = {
    razed: { success: false, error: null as string | null },
    luxdrop: { success: false, error: null as string | null },
    timestamp: new Date().toISOString(),
  };

  try {
    // Refresh Razed leaderboard
    try {
      const razedResponse = await fetch(`${baseUrl}/api/RazedProxy`, {
        method: "GET",
        headers: {
          "Cache-Control": "no-cache",
        },
      });

      if (razedResponse.ok) {
        const data = await razedResponse.json();
        results.razed.success = true;
        if (process.env.NODE_ENV === 'development') {
          console.log(`[Cron] Razed leaderboard refreshed: ${data.data?.length || 0} entries`);
        }
      } else {
        results.razed.error = `HTTP ${razedResponse.status}`;
      }
    } catch (error: any) {
      results.razed.error = error.message || "Unknown error";
      console.error("[Cron] Error refreshing Razed leaderboard:", error);
    }

    // Refresh Luxdrop leaderboard
    try {
      const luxdropResponse = await fetch(`${baseUrl}/api/LuxdropProxy`, {
        method: "GET",
        headers: {
          "Cache-Control": "no-cache",
        },
      });

      if (luxdropResponse.ok) {
        const data = await luxdropResponse.json();
        results.luxdrop.success = true;
        if (process.env.NODE_ENV === 'development') {
          console.log(`[Cron] Luxdrop leaderboard refreshed: ${data.data?.length || 0} entries`);
        }
      } else {
        results.luxdrop.error = `HTTP ${luxdropResponse.status}`;
      }
    } catch (error: any) {
      results.luxdrop.error = error.message || "Unknown error";
      console.error("[Cron] Error refreshing Luxdrop leaderboard:", error);
    }

    const allSuccess = results.razed.success && results.luxdrop.success;
    const statusCode = allSuccess ? 200 : 207; // 207 Multi-Status if partial success

    return res.status(statusCode).json(results);
  } catch (error: any) {
    console.error("[Cron] Unexpected error refreshing leaderboards:", error);
    return res.status(500).json({
      ...results,
      error: error.message || "Failed to refresh leaderboards",
    });
  }
}
