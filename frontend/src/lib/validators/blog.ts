import { z } from "zod";

export const blogSchema = z.object({
  title: z.string().trim().min(3, "Title must be at least 3 characters").max(200, "Title is too long"),
  content: z.string().trim().min(1, "Content is required").max(50_000, "Content is too long"),
});

export type BlogInput = z.infer<typeof blogSchema>;
