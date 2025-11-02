import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const channel = (req.query.channel as string) || process.env.KICK_CHANNEL_NAME || "sweetflips";

  try {
    const upstream = await fetch(`https://kick.com/api/v2/channels/${encodeURIComponent(channel)}`, {
      // Explicitly request CORS-friendly headers are irrelevant server-side
      headers: {
        "Accept": "application/json, text/plain, */*",
        "User-Agent": "sweetflips.gg/1.0 (+https://sweetflips.gg)"
      },
    });

    // Transparently forward status codes
    if (!upstream.ok) {
      const text = await upstream.text();
      return res.status(upstream.status).send(text);
    }

    const data = await upstream.json();

    // Small cache to reduce load; browsers may cache for 20s; Vercel edge cache for 20s
    res.setHeader("Cache-Control", "public, max-age=20, s-maxage=20, stale-while-revalidate=60");
    res.setHeader("Cache-Tag", "kick,channel-status");

    // Return JSON to the client.
    return res.status(200).json(data);
  } catch (err) {
    console.error("Kick channel proxy error:", err);
    return res.status(502).json({ error: "Failed to fetch channel status from Kick" });
  }
}
