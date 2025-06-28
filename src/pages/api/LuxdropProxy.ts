// src/pages/api/LuxdropProxy.ts
import type { NextApiRequest, NextApiResponse } from "next";
import axios, { AxiosRequestConfig } from "axios";

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
    console.error("Server configuration error: Missing Luxdrop API or Leaderboard variables.");
    return res.status(500).json({ error: "Server-side configuration is incomplete." });
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
      console.error("Invalid PROXY_PORT in environment variables. It's not a valid number.");
      // Decide if this is a fatal error or if you want to proceed without proxy
      // For now, let's assume it's not fatal but log it.
    }
  }


  // --- Construct the Axios Request ---
  const params = new URLSearchParams({ codes: codesToFetch }); // Ensure codesToFetch is a string

  const config: AxiosRequestConfig = {
    method: 'get',
    url: `${BASE_API_URL}/external/affiliates`,
    params: params, // Axios will correctly format URLSearchParams
    headers: {
      "x-api-key": API_KEY,
      "Accept": "application/json",
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
      protocol: 'http', // Most HTTP proxies use this protocol
    };
  } else if (proxyHost || proxyPortString || proxyUsername || proxyPassword) {
    // Log if some proxy variables are set but not all, indicating a potential misconfiguration
    console.warn("Proxy configuration is incomplete. Some PROXY environment variables are set, but not all required ones. Proceeding without proxy.");
  }


  try {
    const response = await axios(config);

    const affiliateData = response.data;

    // Try to find the array if it's nested
    let dataToProcess = affiliateData;
    if (!Array.isArray(affiliateData)) {
        const potentialDataArray = affiliateData.data || affiliateData.affiliates || affiliateData.results;
        if (Array.isArray(potentialDataArray)) {
            dataToProcess = potentialDataArray;
        } else {
            console.error("Luxdrop Proxy: API did not return an array of affiliate data, nor a recognized nested array. Received:", affiliateData);
            throw new Error("API response format is not an array as expected.");
        }
    }

    if (!Array.isArray(dataToProcess)) { // Final check
        console.error("Luxdrop Proxy: Could not extract a valid array from API response after checking common nested keys. Response:", affiliateData);
        throw new Error("Could not extract a valid array from API response.");
    }

    const leaderboard = dataToProcess.map((entry: any) => ({
      username: entry.code,
      wagered: Number(entry.wagered) || 0,
      reward: 0, // Placeholder
    }));

    const sortedLeaderboard = leaderboard.sort((a, b) => b.wagered - a.wagered);

    res.setHeader("Cache-Control", "public, s-maxage=600, stale-while-revalidate=300");
    res.status(200).json({ data: sortedLeaderboard });

  } catch (error: any) {
    console.error("Luxdrop Proxy Error Details:", error);
    // Check if it's an Axios error to get more details
    if (axios.isAxiosError(error)) {
        console.error("Axios error message:", error.message);
        console.error("Axios error response:", error.response?.data);
        console.error("Axios error request config:", error.config);
        if (error.config?.proxy) {
            console.error("Axios request was configured to use proxy:", error.config.proxy);
        } else {
            console.error("Axios request was NOT configured to use proxy.");
        }
    }
    const statusCode = error.response?.status || 500;
    const errorMessage = error.response?.data?.error || error.message || "Failed to fetch data from Luxdrop API via proxy.";
    res.status(statusCode).json({ error: errorMessage, details: error.response?.data || error.message });
  }
}