import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
import { CreateBookSchema } from "../../../schemas/createbook";
import { verifyToken } from "../../../utils/verifyToken";

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const token = authHeader.split(" ")[1];
    const user = verifyToken(token);

    if (!user) {
      return res.status(401).json({ error: "Invalid or expired token" });
    }

   if (req.method === "GET") {
  if (!user) return res.status(401).json({ error: "Unauthorized" });

  const books = await prisma.book.findMany({
    include: {
      genres: { include: { genre: true } },
      reviews: true,
      UserBookStatus: {
        where: {  userId: user.id}, 
      },
    },
  });

  const result = books.map(book => ({
    ...book,
    userStatus: book.UserBookStatus[0]?.status || null, 
    bookStatus: undefined, 
  }));

  return res.status(200).json({ books: result });
}


    if (req.method === "POST") {
      if (user.role !== "admin") {
        return res.status(403).json({ error: "Forbidden: Admins only" });
      }

      const parsed = CreateBookSchema.parse(req.body);

      let genreRecords: { id: number }[] = [];
      if (parsed.genres && parsed.genres.length > 0) {
        genreRecords = await Promise.all(
          parsed.genres.map(async (name: string) => {
            const genre = await prisma.genre.upsert({
              where: { name },
              update: {},
              create: { name },
            });
            return { id: genre.id };
          })
        );
      }

      const book = await prisma.book.create({
        data: {
          title: parsed.title,
          author: parsed.author,
          description: parsed.description,
          coverUrl: parsed.coverUrl,
          publishedYr: parsed.publishedYr,
          genres: {
            create: genreRecords.map((g) => ({ genre: { connect: { id: g.id } } })),
          },
        },
        include: {
          genres: { include: { genre: true } },
          reviews: true,
        },
      });

      return res.status(201).json({ message: "Book created successfully", book });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (error: unknown) {
    console.error(error);
    if (error && typeof error === 'object' && 'errors' in error) {
      return res.status(400).json({ error: (error as { errors: unknown }).errors });
    }
    return res.status(500).json({ error: "Something went wrong" });
  }
}
