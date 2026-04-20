import { Impit } from "impit";
import type { NextApiRequest, NextApiResponse } from "next";

const SMARTICO_API_URL = "https://data-api3.aff.spartans.com/plywood?by=";
const SMARTICO_ORIGIN = "https://data-api3.aff.spartans.com";
const DEFAULT_SMARTICO_LABEL_ID = "591127";
const MAX_LEADERBOARD_ENTRIES = 25;

type SmarticoSplitEntry = {
  username?: unknown;
  volume?: unknown;
};

type SmarticoPlywoodResponse = {
  result?: {
    data?: Array<{
      username?: unknown;
      volume?: unknown;
      SPLIT?: {
        data?: SmarticoSplitEntry[];
      };
    }>;
  };
};

type LeaderboardEntry = {
  username: string;
  wagered: number;
};

function maskUsername(username: string): string {
  const len = username.length;
  if (len <= 2) return username;
  if (len <= 4) return username[0] + "*".repeat(len - 2) + username[len - 1];
  return username.slice(0, 2) + "*".repeat(len - 4) + username.slice(-2);
}

function normalizeNumber(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const cleaned = value.replace(/[$,\s]/g, "");
    const parsed = Number.parseFloat(cleaned);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  return 0;
}

function getCurrentMonthUtcRange(now: Date): { start: string; end: string } {
  const start = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 0, 0, 0, 0),
  );
  const end = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1, 0, 0, 0, 0),
  );

  return {
    start: start.toISOString(),
    end: end.toISOString(),
  };
}

function patchMonthlyTimeRanges(payload: unknown, now: Date): boolean {
  const { start, end } = getCurrentMonthUtcRange(now);
  let patched = false;

  const visit = (value: unknown) => {
    if (Array.isArray(value)) {
      value.forEach(visit);
      return;
    }

    if (!value || typeof value !== "object") {
      return;
    }

    const record = value as Record<string, unknown>;
    if (
      record.setType === "TIME_RANGE" &&
      Array.isArray(record.elements) &&
      record.elements.length > 0
    ) {
      record.elements = record.elements.map((element) => {
        if (!element || typeof element !== "object") {
          return { start, end };
        }

        return {
          ...(element as Record<string, unknown>),
          start,
          end,
        };
      });
      patched = true;
    }

    Object.values(record).forEach(visit);
  };

  visit(payload);
  return patched;
}

function parseSmarticoPayload(rawPayload: string, now: Date): unknown {
  const parsed = JSON.parse(rawPayload) as unknown;
  const payload =
    typeof parsed === "object" && parsed !== null
      ? JSON.parse(JSON.stringify(parsed))
      : parsed;

  const didPatch = patchMonthlyTimeRanges(payload, now);
  if (!didPatch) {
    console.warn(
      "[SpartansProxy] Smartico payload did not contain a TIME_RANGE literal; using env payload as-is.",
    );
  }

  return payload;
}

function extractLeaderboardEntries(
  responseBody: SmarticoPlywoodResponse,
): LeaderboardEntry[] {
  const topLevelData = responseBody.result?.data;
  const splitData = responseBody.result?.data?.[0]?.SPLIT?.data;

  const rawEntries: SmarticoSplitEntry[] = Array.isArray(splitData)
    ? splitData
    : Array.isArray(topLevelData)
      ? topLevelData
      : [];

  if (rawEntries.length === 0) {
    throw new Error(
      "Smartico response missing split rows in result.data or result.data[0].SPLIT.data",
    );
  }

  return rawEntries
    .map((entry) => {
      const rawUsername =
        typeof entry.username === "string" ? entry.username.trim() : "";
      const wagered = normalizeNumber(entry.volume);

      return {
        username: rawUsername,
        wagered,
      };
    })
    .filter((entry) => {
      if (!entry.username) return false;
      if (entry.username.toLowerCase() === "empty") return false;
      return entry.wagered > 0;
    })
    .sort((a, b) => b.wagered - a.wagered)
    .slice(0, MAX_LEADERBOARD_ENTRIES)
    .map((entry) => ({
      username: maskUsername(entry.username),
      wagered: entry.wagered,
    }));
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  try {
    const now = new Date();
    const isCronRefresh =
      req.query.cron_refresh === "1" &&
      req.headers.authorization === `Bearer ${process.env.CRON_SECRET}`;

    const labelId = (
      process.env.SPARTANS_SMARTICO_LABEL_ID || DEFAULT_SMARTICO_LABEL_ID
    ).trim();
    const cookieHeader = process.env.SPARTANS_SMARTICO_COOKIE?.trim();
    const rawPayload = process.env.SPARTANS_SMARTICO_PAYLOAD?.trim();

    const missingConfig = [
      !cookieHeader ? "SPARTANS_SMARTICO_COOKIE" : null,
      !rawPayload ? "SPARTANS_SMARTICO_PAYLOAD" : null,
    ].filter(Boolean);

    if (missingConfig.length > 0) {
      return res.status(500).json({
        error: "Smartico configuration is incomplete",
        message: `Missing required environment variables: ${missingConfig.join(", ")}`,
      });
    }

    let requestBody: unknown;
    try {
      requestBody = parseSmarticoPayload(rawPayload!, now);
    } catch (error) {
      console.error("[SpartansProxy] Invalid SPARTANS_SMARTICO_PAYLOAD:", error);
      return res.status(500).json({
        error: "Invalid Smartico payload configuration",
        message:
          error instanceof Error ? error.message : "Unable to parse Smartico payload",
      });
    }

    const referer = `${SMARTICO_ORIGIN}/?label_id=${encodeURIComponent(labelId)}&noNav=true&hideHeader=false&hideControls=false&hideMeasures=true`;

    const proxyHost = process.env.PROXY_HOST?.trim();
    const proxyPort = process.env.PROXY_PORT?.trim();
    const proxyUser = process.env.PROXY_USERNAME?.trim();
    const proxyPass = process.env.PROXY_PASSWORD?.trim();
    const proxyUrl =
      proxyHost && proxyPort
        ? `http://${proxyUser}:${proxyPass}@${proxyHost}:${proxyPort}`
        : undefined;

    const impit = new Impit({ browser: "chrome", proxyUrl });
    const response = await impit.fetch(SMARTICO_API_URL, {
      method: "POST",
      headers: {
        Accept: "application/json, text/plain, */*",
        "Content-Type": "application/json;charset=UTF-8",
        Cookie: cookieHeader!,
        Origin: SMARTICO_ORIGIN,
        Referer: referer,
        "x-smartico-active-label-id": labelId,
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(
        () => "Unable to read error response",
      );
      console.error(
        `[SpartansProxy] Smartico API error ${response.status}: ${errorText.substring(0, 200)}`,
      );

      return res.status(response.status).json({
        error: `Smartico Spartans API error: ${response.status}`,
        message: errorText.substring(0, 200),
      });
    }

    let responseBody: SmarticoPlywoodResponse;
    try {
      responseBody = (await response.json()) as SmarticoPlywoodResponse;
    } catch (error) {
      console.error("[SpartansProxy] Smartico JSON parse error:", error);
      return res.status(500).json({
        error: "Invalid JSON response from Smartico Spartans API",
      });
    }

    let leaderboardData: LeaderboardEntry[];
    try {
      leaderboardData = extractLeaderboardEntries(responseBody);
    } catch (error) {
      console.error("[SpartansProxy] Smartico response shape error:", error);
      return res.status(502).json({
        error: "Unexpected Smartico Spartans response shape",
        message: error instanceof Error ? error.message : "Unknown response shape error",
      });
    }

    if (isCronRefresh) {
      res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
    } else {
      res.setHeader("Cache-Control", "public, max-age=30, s-maxage=30");
    }
    res.setHeader("Cache-Tag", "leaderboard,spartans");
    res.setHeader("Last-Modified", now.toUTCString());

    return res.status(200).json({
      data: leaderboardData,
      source: "smartico-plywood",
    });
  } catch (error) {
    console.error("SpartansProxy error:", error);
    return res.status(500).json({
      error: "Failed to fetch Spartans leaderboard data",
      message: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString(),
    });
  }
}
