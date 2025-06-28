// src/pages/api/LuxdropProxy.ts
import type { NextApiRequest, NextApiResponse } from "next";
import axios, { AxiosRequestConfig } from "axios";
import { DateTime } from "luxon";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  // --- Read API and Leaderboard Config from Environment ---
  const codesToFetch = process.env.LUXDROP_LEADERBOARD_CODES;
  const API_KEY = process.env.LUXDROP_API_KEY;
  const BASE_API_URL = process.env.BASE_LUXDROP_API_URL;

  if (!codesToFetch || !API_KEY || !BASE_API_URL) {
    console.error(
      "Server configuration error: Missing Luxdrop API or Leaderboard variables.",
    );
    return res
      .status(500)
      .json({ error: "Server-side configuration is incomplete." });
  }

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
    } else {
      console.error(
        "Invalid PROXY_PORT in environment variables. It's not a valid number.",
      );
    }
  }

  // --- ADDED: Date Logic for Monthly Leaderboard ---
  const now = DateTime.utc();
  const startDate = now.startOf("month").toISODate(); // e.g., "2024-05-01"
  const endDate = now.endOf("month").toISODate(); // e.g., "2024-05-31"
  // ---

  // --- Construct the Axios Request ---
  const params = {
    codes: codesToFetch,
    startDate: startDate, // Send the calculated start date
    endDate: endDate, // Send the calculated end date
  };

  const config: AxiosRequestConfig = {
    method: "get",
    url: `${BASE_API_URL}/external/affiliates`,
    params: params, // Pass the params object to Axios
    headers: {
      "x-api-key": API_KEY,
      Accept: "application/json",
    },
  };

  // --- Conditionally Add Proxy to the Request ---
  if (proxyHost && proxyPort && proxyUsername && proxyPassword) {
    config.proxy = {
      host: proxyHost,
      port: proxyPort,
      auth: {
        username: proxyUsername,
        password: proxyPassword,
      },
      protocol: "http",
    };
  } else if (proxyHost || proxyPortString || proxyUsername || proxyPassword) {
    console.warn(
      "Proxy configuration is incomplete. Proceeding without proxy.",
    );
  }

  try {
    const response = await axios(config);
    const affiliateData = response.data;

    console.log("affiliateData: ", affiliateData);
    // Ensure we have an array to process
    if (!Array.isArray(affiliateData)) {
      console.error(
        "Luxdrop Proxy: API did not return an array as expected. Received:",
        affiliateData,
      );
      throw new Error("API response format is not an array as expected.");
    }

    const leaderboard = affiliateData.map((entry: any) => ({
      username: entry.username,
      wagered: Number(entry.wagered) || 0,
      reward: 0,
    }));

    console.log("leaderboard: ", leaderboard);
    const sortedLeaderboard = leaderboard.sort((a, b) => b.wagered - a.wagered);

    res.setHeader(
      "Cache-Control",
      "public, s-maxage=600, stale-while-revalidate=300",
    );
    res.status(200).json({ data: sortedLeaderboard });
  } catch (error: any) {
    // Keep your detailed error logging
    console.error("Luxdrop Proxy Error Details:", error);
    if (axios.isAxiosError(error)) {
      console.error("Axios error message:", error.message);
      console.error("Axios error response:", error.response?.data);
    }
    const statusCode = error.response?.status || 500;
    const errorMessage =
      error.response?.data?.error ||
      error.message ||
      "Failed to fetch data from Luxdrop API via proxy.";
    res.status(statusCode).json({
      error: errorMessage,
      details: error.response?.data || error.message,
    });
  }
}
