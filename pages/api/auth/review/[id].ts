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
  const { id } = req.query;
  const reviewId = parseInt(id as string);

  const user = await getUser(req);
  if (!user) return res.status(401).json({ error: "Unauthorized" });

  try {
    if (req.method === "PUT") {
      const { reviewTxt, rating } = req.body;

      const existingReview = await prisma.review.findUnique({
        where: { id: reviewId },
      });

      if (!existingReview) return res.status(404).json({ error: "Review not found" });
      if (existingReview.userId !== user.id) {
        return res.status(403).json({ error: "Not allowed to edit this review" });
      }

      const updated = await prisma.review.update({
        where: { id: reviewId },
        data: { reviewTxt, rating },
      });

      return res.status(200).json({ review: updated });
    }

    if (req.method === "DELETE") {
      const existingReview = await prisma.review.findUnique({
        where: { id: reviewId },
      });

      if (!existingReview) return res.status(404).json({ error: "Review not found" });
      if (user.role !== "admin" && existingReview.userId !== user.id) {
        return res.status(403).json({ error: "Not allowed to delete this review" });
      }

      await prisma.review.delete({ where: { id: reviewId } });

      return res.status(200).json({ message: "Review deleted successfully" });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (error) {
    console.error("Review handler error:", error);
    res.status(500).json({ error: "Server error" });
  }
}
