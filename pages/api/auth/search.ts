import type { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const search = req.query.search?.toString().toLowerCase() || "";
  const genre = req.query.genre?.toString().toLowerCase() || "";

  try {
    const books = await prisma.book.findMany({
      where: {
        AND: [
          search
            ? {
                OR: [
                  { title: { contains: search } },
                  { author: { contains: search } },
                ],
              }
            : {},
          genre
            ? {
                genres: {
                  some: {
                    genre: {
                      name: {
                        equals: genre
                      },
                    },
                  },
                },
              }
            : {},
        ],
      },
      include: {
        genres: { include: { genre: true } },
        reviews: true,
      },
    });

    if (books.length === 0) {
      return res.status(404).json({ message: "No book in this category" });
    }

    res.status(200).json({ books });
  } catch (error) {
    console.error("Fetch books error:", error);
    res.status(500).json({ error: "Server error" });
  }
}
