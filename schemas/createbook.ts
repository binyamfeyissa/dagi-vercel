import { z } from "zod";

export const CreateBookSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters"),
  author: z.string().min(2, "Author must be at least 2 characters"),
  description: z.string().optional(),
  coverUrl: z.string().url().optional(),
  publishedYr: z.number().int().optional(),
  genres: z.array(z.string().min(2)).optional(), // genre names
});
