// src/pages/api/LuxdropProxy.ts
import axios, { AxiosRequestConfig } from "axios";
import { HttpsProxyAgent } from "https-proxy-agent";
import { DateTime } from "luxon";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  console.log("=== LUXDROP API CALLED ===");

  // --- Read API and Leaderboard Config from Environment ---
  const API_KEY = process.env.LUXDROP_API_KEY || "113ecb6008668493dffd81f3a4466633cea823ea07c801e75882558a66f722cd";

  console.log("Environment check:");
  console.log("LUXDROP_API_KEY:", API_KEY ? "SET" : "MISSING");

  // --- Use exact proxy configuration from working Python script ---
  const proxyHost = "46.202.3.151";
  const proxyPort = 7417;
  const proxyUsername = "ozxnqgrw";
  const proxyPassword = "kbqc558eowm4";

  // --- Date Logic for Contest Period Leaderboard ---
  const currentTime = DateTime.utc();
  let startDate: DateTime;
  let endDate: DateTime;

  // Contest Period: July 28, 2025 - August 31, 2025
  // This matches the working Python script parameters
  startDate = DateTime.utc(2025, 7, 28, 0, 0, 0, 0);
  endDate = DateTime.utc(2025, 8, 31, 23, 59, 59, 999);

  const startDateISO = startDate.toISODate(); // "2025-07-28"
  const endDateISO = endDate.toISODate();     // "2025-08-31"

  console.log("=== DATE DEBUG ===");
  console.log("Current time:", currentTime.toISO());
  console.log("Current year:", currentTime.year);
  console.log("Current month:", currentTime.month);
  console.log("Current day:", currentTime.day);
  console.log("Date range:", startDateISO, "to", endDateISO);
  console.log("Start date object:", startDate.toISO());
  console.log("End date object:", endDate.toISO());

  // --- Construct the API Request ---
  // Using exact parameters that work in Python script: codes, startDate, endDate
  const params = {
    codes: "sweetflips", // Use exact working affiliate code
    startDate: startDateISO, // "2025-07-28"
    endDate: endDateISO,     // "2025-08-31"
  };

  console.log("=== API PARAMETERS ===");
  console.log("Request params:", JSON.stringify(params, null, 2));

  // Create proxy agent using exact working configuration
  const proxyUrl = `http://${proxyUsername}:${proxyPassword}@${proxyHost}:${proxyPort}`;
  const proxyAgent = new HttpsProxyAgent(proxyUrl);
  console.log("Using exact working proxy:", `${proxyHost}:${proxyPort}`);

  // Exact API configuration matching working Python script
  const config: AxiosRequestConfig = {
    method: "get",
    url: "https://api.luxdrop.com/external/affiliates", // Use exact URL from Python script
    params: params,
    timeout: 30000,
    headers: {
      "x-api-key": API_KEY,
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      "Accept": "application/json",
    },
    httpsAgent: proxyAgent,
    httpAgent: proxyAgent,
  };

  try {
    console.log("=== API REQUEST DEBUG ===");
    console.log("Making API request to:", config.url);
    console.log("Request params:", JSON.stringify(params, null, 2));
    console.log("Codes parameter:", params.codes);
    console.log("Start date parameter:", params.startDate);
    console.log("End date parameter:", params.endDate);

    const response = await axios(config);
    const affiliateData = response.data;

    console.log("✅ Successfully received data from Luxdrop API!");
    console.log("Data type:", typeof affiliateData);
    console.log("Is array:", Array.isArray(affiliateData));
    console.log("Entries:", Array.isArray(affiliateData) ? affiliateData.length : 'N/A');

    if (!Array.isArray(affiliateData)) {
      throw new Error("API response is not an array");
    }

    console.log("✅ Using real contest period API data for:", startDateISO, "to", endDateISO);

    // Validate we have reasonable contest period data
    const totalWagered = affiliateData.reduce((sum: number, entry: any) => sum + (Number(entry.wagered) || 0), 0);
    console.log("Total wagered from API:", totalWagered);

    // Filter only users with wagers > 0 (like Python script does)
    const activeWagerers = affiliateData.filter((entry: any) => Number(entry.wagered) > 0);
    console.log("Active wagerers:", activeWagerers.length, "of", affiliateData.length);

    // Process the real API data - sort by wagered amount descending
    const leaderboard = activeWagerers
      .map((entry: any) => ({
        username: entry.username || `User${entry.id}`,
        wagered: Math.round((Number(entry.wagered) || 0) * 100) / 100,
        reward: 0,
      }))
      .sort((a, b) => b.wagered - a.wagered)
      .slice(0, 100); // Top 100 for performance

    console.log("Contest period leaderboard generated:");
    console.log("- Total active wagerers:", leaderboard.length);
    console.log("- Top wagerer:", leaderboard[0]?.username, "$" + leaderboard[0]?.wagered);
    console.log("- Total period wagered: $" + totalWagered.toFixed(2));

    res.setHeader("Cache-Control", "public, s-maxage=600, stale-while-revalidate=300");
    res.status(200).json({ data: leaderboard });

  } catch (error: any) {
    console.error("❌ Real API failed:", error.message);
    console.error("Status:", error.response?.status);

    // Return error when API fails - no fallback data needed
    res.status(500).json({
      error: "Failed to fetch leaderboard data",
      message: error.message
    });
  }
}
