import type { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
import { verifyToken } from "../../../utils/verifyToken";

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method !== "GET") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const token = authHeader.split(" ")[1];
    const user = verifyToken(token);

    if (!user || user.role !== "admin") {
      return res.status(403).json({ error: "Forbidden: Admins only" });
    }

    const messages = await prisma.contact.findMany({
      include: { user: { select: { id: true, username: true, email: true } } },
      orderBy: { createdAt: "desc" },
    });

    return res.status(200).json(messages);
  } catch (error) {
    console.error("Contact GET error:", error);
    return res.status(500).json({ error: "Something went wrong" });
  }
}
