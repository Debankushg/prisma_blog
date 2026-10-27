import type { Blog } from "@/types";
import type { BlogInput } from "@/lib/validators/blog";
import { http } from "./http";

export const blogsApi = {
  create: (input: BlogInput) => http.post<Blog>("/blogs", input),
  update: (id: string, input: Partial<BlogInput>) => http.patch<Blog>(`/blogs/${id}`, input),
  remove: (id: string) => http.delete<null>(`/blogs/${id}`),
};
