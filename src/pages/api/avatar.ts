import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/getUserFromRequest";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = await getUserFromRequest(req);
  
  if (!user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (req.method === "GET") {
    try {
      const avatar = await prisma.avatar.findUnique({
        where: { userId: user.id },
      });

      return res.status(200).json({ avatar });
    } catch (error) {
      console.error("Error fetching avatar:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  if (req.method === "POST") {
    try {
      const {
        skin,
        hair,
        hairColor,
        facialHair,
        top,
        jacket,
        bottom,
        shoes,
        hat,
        glasses,
        accessories,
      } = req.body;

      const avatar = await prisma.avatar.upsert({
        where: { userId: user.id },
        update: {
          skin,
          hair,
          hairColor,
          facialHair,
          top,
          jacket,
          bottom,
          shoes,
          hat,
          glasses,
          accessories: accessories || [],
        },
        create: {
          userId: user.id,
          skin,
          hair,
          hairColor,
          facialHair,
          top,
          jacket,
          bottom,
          shoes,
          hat,
          glasses,
          accessories: accessories || [],
        },
      });

      return res.status(200).json({ avatar });
    } catch (error) {
      console.error("Error saving avatar:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}