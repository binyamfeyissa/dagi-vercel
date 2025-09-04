import { z } from "zod";

export const BookSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters long"),
  author: z.string().min(3, "Author name must be at least 3 characters long"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  genre: z.string().min(1, "Genre is required"),
  publishedYr: z.number().int().min(1000, "Enter a valid year").max(new Date().getFullYear()),
  coverUrl: z.string().url().optional(), 
  fileUrl: z.string().url().optional(),  
});
