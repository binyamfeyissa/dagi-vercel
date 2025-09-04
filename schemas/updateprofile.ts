import { z } from "zod";

export const UpdateProfileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").optional(),
  gender: z.enum(["male", "female", "other"]).optional(),
  favoriteGenres: z.array(z.string().min(2)).optional(),
  birthdate: z.string().refine((val) => !val || !isNaN(Date.parse(val)), {
    message: "Invalid date format",
  }).optional(),
  country: z.string().min(2, "Country must be at least 2 characters").optional(),
});
