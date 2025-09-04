import type { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET!;

async function getUser(req: NextApiRequest) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) return null;

  const token = authHeader.split(" ")[1];

  try {
    const payload = jwt.verify(token, JWT_SECRET) as { id: number; role: string };
    return { id: payload.id, role: payload.role };
  } catch {
    return null;
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = await getUser(req);
  if (!user) return res.status(401).json({ error: "Unauthorized" });

  try {

    if (req.method === "POST") {
      const { bookId, reviewTxt, rating } = req.body;

      if (!bookId || !reviewTxt || !rating) {
        return res.status(400).json({ error: "bookId, reviewTxt, and rating are required" });
      }

      const review = await prisma.review.create({
        data: {
          reviewTxt,
          rating,
          userId: user.id,
          bookId: parseInt(bookId),
        },
      });

      return res.status(201).json({ review });
    }

    // Get reviews for a specific book
    if (req.method === "GET") {
      const bookId = req.query.bookId?.toString();
      if (!bookId) {
        return res.status(400).json({ error: "bookId query parameter is required" });
      }

      const reviews = await prisma.review.findMany({
        where: { bookId: parseInt(bookId) },
        include: {
          user: { select: { id: true, username: true, email: true } },
          book: { select: { id: true, title: true, author: true } },
        },
        orderBy: { createdAt: "desc" },
      });

      if (reviews.length === 0) {
        return res.status(404).json({ message: "No reviews for this book" });
      }

      return res.status(200).json({ reviews });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (error) {
    console.error("Review handler error:", error);
    res.status(500).json({ error: "Server error" });
  }
}
