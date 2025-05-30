import { prisma } from '../../../../lib/prisma';
import type { NextApiRequest, NextApiResponse } from "next";
import { parse } from "cookie";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    // ✅ Publicly accessible: used by StreamScheduleTabs
    const data = await prisma.streamSchedule.findMany({ orderBy: { day: "asc" } });
    return res.status(200).json(data);
  }

  // ✅ POST should only be accessible by admins
  if (req.method === "POST") {
    const cookies = parse(req.headers.cookie || "");
    const accessToken = cookies.access_token;

    if (!accessToken) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const userRes = await fetch("https://api.kick.com/public/v1/users", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    const kickData = await userRes.json();
    const kickId = kickData?.data?.[0]?.user_id?.toString();

    if (!kickId) {
      return res.status(401).json({ error: "Invalid Kick user" });
    }

    const user = await prisma.user.findUnique({ where: { kickId } });

    if (!user || user.role !== "admin") {
      return res.status(403).json({ error: "Admin access required" });
    }

    // ✅ Authorized admin can create schedule entry
    const { day, name, titel, time } = req.body;

    try {
      const item = await prisma.streamSchedule.create({
        data: { day, name, titel, time },
      });

      return res.status(201).json(item);
    } catch (error) {
      console.error("Failed to create schedule entry:", error);
      return res.status(500).json({ error: "Failed to create schedule entry" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
