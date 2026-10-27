import "server-only";
import { ApiClientError } from "@/lib/api/errors";
import { publicGet } from "@/lib/api/server";
import type { ListParams } from "@/lib/validators/blog-list";
import type { Paginated, PublicBlogDetail, PublicBlogSummary } from "@/types";

export const getPublicBlogs = (params: ListParams, limit = 9) => {
  const qs = new URLSearchParams({
    page: String(params.page),
    limit: String(limit),
    // The public API calls the publish date `publishedAt` and has no "recently updated" sort.
    sort: params.sort === "title" || params.sort === "author" ? params.sort : "publishedAt",
    order: params.order,
  });
  if (params.author) qs.set("author", params.author);
  return publicGet<Paginated<PublicBlogSummary>>(`/public/blogs?${qs}`);
};

/** Returns null when the post doesn't exist (or the id is malformed). */
export async function getPublicBlog(id: string): Promise<PublicBlogDetail | null> {
  try {
    return await publicGet<PublicBlogDetail>(`/public/blogs/${encodeURIComponent(id)}`);
  } catch (error) {
    if (error instanceof ApiClientError && (error.status === 404 || error.status === 422)) return null;
    throw error;
  }
}
