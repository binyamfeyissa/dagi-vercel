import type { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
import { verifyToken } from "../../../utils/verifyToken";

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) return res.status(401).json({ error: "Unauthorized" });

  const token = authHeader.split(" ")[1];
  const user = verifyToken(token);
  if (!user?.id) return res.status(401).json({ error: "Invalid token" });

  try {
    if (req.method === "GET") {
      const statuses = await prisma.userBookStatus.findMany({
        where: { userId: user.id },
        include: { book: true },
        orderBy: { createdAt: "desc" },
      });
      return res.status(200).json(statuses);
    }

    if (req.method === "POST") {
      const { bookId, status } = req.body;
      if (!bookId || !["read", "want_to_read"].includes(status)) {
        return res.status(400).json({ error: "Invalid bookId or status" });
      }

      const upserted = await prisma.userBookStatus.upsert({
        where: { userId_bookId: { userId: user.id, bookId } },
        update: { status },
        create: { userId: user.id, bookId, status },
      });

      return res.status(200).json({ message: "Book status updated!", upserted });
    }

    if (req.method === "PATCH") {
      const { bookId, status } = req.body;
      if (!bookId || !["read", "want_to_read"].includes(status)) {
        return res.status(400).json({ error: "Invalid bookId or status" });
      }

      const existing = await prisma.userBookStatus.findUnique({
        where: { userId_bookId: { userId: user.id, bookId } },
      });

      if (!existing) return res.status(404).json({ error: "Book status not found" });

      const updated = await prisma.userBookStatus.update({
        where: { userId_bookId: { userId: user.id, bookId } },
        data: { status },
      });

      return res.status(200).json({ message: "Book status edited!", updated });
    }

    if (req.method === "DELETE") {
      const { bookId } = req.body;
      if (!bookId) return res.status(400).json({ error: "bookId is required" });

      await prisma.userBookStatus.delete({
        where: { userId_bookId: { userId: user.id, bookId } },
      });

      return res.status(200).json({ message: "Book status removed" });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (error) {
    console.error("UserBookStatus API error:", error);
    return res.status(500).json({ error: "Server error" });
  }
}
